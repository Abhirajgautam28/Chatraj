import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || '';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Prefer proxying to local backend during interactive development so the
// browser sees same-origin requests (Vite dev server proxy). This preserves
// cookies and avoids SameSite cross-site issues when running frontend on a
// different port during development.
if (import.meta.env.DEV && isLocalhost) {
  API_URL = '';
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
let _cachedSignedXsrf = null;

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
      // Include signed stateless CSRF token when available (fallback for
      // browsers that block third-party cookies). The backend will accept
      // this header as an alternative to cookie-based csurf validation.
      if (_cachedSignedXsrf) config.headers['X-CSRF-SIGNED'] = _cachedSignedXsrf;
    } catch (e) {
      // ignore in non-browser environments or when fetch fails
    }

    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        clearCsrfCache();
        // Avoid redirecting if we're already on login/register/home
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
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
        const signed = data && data.signedCsrf ? data.signedCsrf : null;
        if (token) {
          _cachedXsrf = token;
          // Do NOT write the XSRF cookie from client-side JS. Writing here
          // can overwrite the server-set cookie and strip Secure/SameSite
          // attributes, preventing the browser from sending the server's
          // httpOnly `_csrf` cookie on cross-site requests. Rely on the
          // server to set cookie attributes correctly and use the returned
          // token value directly for headers.
        }
        if (signed) {
          _cachedSignedXsrf = signed;
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

// Clear in-memory CSRF caches. Call this when the user logs out or when
// authentication state is reset so we don't reuse stale tokens in the same tab.
export function clearCsrfCache() {
  _cachedXsrf = null;
  _cachedSignedXsrf = null;
  _xsrfFetchPromise = null;
}