import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Prefer local backend during interactive development on localhost so the
// developer experience doesn't require switching env files to test locally.
if (import.meta.env.DEV && isLocalhost) {
  API_URL = 'http://localhost:8080';
} else {
  if (!API_URL || API_URL === '' || API_URL === window.location.origin) {
    API_URL = 'http://localhost:8080';
  }
}

API_URL = API_URL.replace(/\/$/, '');

const axiosInstance = axios.create({
  baseURL: API_URL
});

// ensure cookies (including XSRF cookie) are sent with requests
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.xsrfCookieName = 'XSRF-TOKEN';
axiosInstance.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

axiosInstance.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Ensure XSRF header is present. For same-origin setups we can read
    // the cookie directly; for cross-origin setups (frontend != backend)
    // the cookie will belong to the API domain and won't be visible to
    // `document.cookie`. In that case, fetch the token from the `/csrf-token`
    // endpoint (it returns the token in JSON) and attach it to the header.
    try {
      const xsrfHeaderName = axiosInstance.defaults.xsrfHeaderName || 'X-XSRF-TOKEN';
      const xsrfCookieName = axiosInstance.defaults.xsrfCookieName || 'XSRF-TOKEN';

      // try reading cookie first (works for same-origin)
      let xsrfValue = null;
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^|; )' + xsrfCookieName + '=([^;]*)'));
        if (match) xsrfValue = decodeURIComponent(match[2]);
      }

      // if cookie not present (likely cross-origin), fetch token from API
      if (!xsrfValue && typeof window !== 'undefined') {
        try {
          const csrfUrl = `${API_URL}/csrf-token`;
          const resp = await fetch(csrfUrl, {
            credentials: 'include',
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          if (resp.ok) {
            const data = await resp.json();
            xsrfValue = data && data.csrfToken ? data.csrfToken : null;
            // also set a cookie in-memory for this page load for subsequent requests
            if (xsrfValue && typeof document !== 'undefined') {
              // set a non-secure cookie for same-origin dev flows; browser
              // will ignore domain differences for cookies set here, but
              // we avoid setting attributes so this is lightweight.
              document.cookie = `${xsrfCookieName}=${encodeURIComponent(xsrfValue)}; path=/`;
            }
          }
        } catch (fetchErr) {
          // ignore fetch errors; the request will likely fail with CSRF if token is required
        }
      }

      if (xsrfValue) {
        config.headers[xsrfHeaderName] = xsrfValue;
      }
    } catch (e) {
      // ignore in non-browser environments
    }

    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;

// Named export: explicit helper to fetch CSRF token from the API and return it.
export async function getCsrfToken() {
  const xsrfCookieName = axiosInstance.defaults.xsrfCookieName || 'XSRF-TOKEN';
  try {
    // First try to read cookie (same-origin)
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^|; )' + xsrfCookieName + '=([^;]*)'));
      if (match) return decodeURIComponent(match[2]);
    }

    // Otherwise, request the token from the API (cross-origin scenarios)
    const resp = await fetch(`${API_URL}/csrf-token`, {
      credentials: 'include',
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const token = data && data.csrfToken ? data.csrfToken : null;
    if (token && typeof document !== 'undefined') {
      document.cookie = `${xsrfCookieName}=${encodeURIComponent(token)}; path=/`;
    }
    return token;
  } catch (e) {
    return null;
  }
}