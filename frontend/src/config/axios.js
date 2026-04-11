import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Prefer local backend during interactive development on localhost so the
// developer experience doesn't require switching env files to test locally.
if (import.meta.env.DEV && isLocalhost) {
  API_URL = 'http://localhost:8080';
} else {
  if (!API_URL || API_URL === '' || (typeof window !== 'undefined' && API_URL === window.location.origin)) {
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

// Simple in-memory cache and single in-flight fetch memoization for CSRF token
let _cachedXsrf = null;
let _xsrfFetchPromise = null;

axiosInstance.interceptors.request.use(
  async config => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Ensure XSRF header is present. Use cached value or the memoized fetch helper
    try {
      const xsrfHeaderName = axiosInstance.defaults.xsrfHeaderName || 'X-XSRF-TOKEN';
      const xsrfValue = await getCsrfToken();
      if (xsrfValue) config.headers[xsrfHeaderName] = xsrfValue;
    } catch (e) {
      // ignore in non-browser environments or when fetch fails
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
    // 1) Prefer cookie when available (same-origin)
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^|; )' + xsrfCookieName + '=([^;]*)'));
      if (match) {
        const v = decodeURIComponent(match[2]);
        _cachedXsrf = v;
        return v;
      }
    }

    // 2) Return cached token if present
    if (_cachedXsrf) return _cachedXsrf;

    // 3) If a fetch is already in-flight, await it (memoize in-flight)
    if (_xsrfFetchPromise) return await _xsrfFetchPromise;

    // 4) Otherwise start a single fetch and memoize it for concurrent callers
    _xsrfFetchPromise = (async () => {
      try {
        const resp = await fetch(`${API_URL}/csrf-token`, {
          credentials: 'include',
          method: 'GET',
          headers: { Accept: 'application/json' }
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        const token = data && data.csrfToken ? data.csrfToken : null;
        if (token) {
          _cachedXsrf = token;
        }
        return token;
      } catch (e) {
        return null;
      } finally {
        _xsrfFetchPromise = null;
      }
    })();

    return await _xsrfFetchPromise;
  } catch (e) {
    return null;
  }
}