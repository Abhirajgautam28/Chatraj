import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL || API_URL === '' || API_URL === window.location.origin) {
  API_URL = 'http://localhost:8080';
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
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Ensure XSRF header is present by reading the cookie directly (some
    // browsers/environments do not have axios auto-populate the header for
    // cross-origin requests even when withCredentials is true).
    try {
      const xsrfCookieName = axiosInstance.defaults.xsrfCookieName || 'XSRF-TOKEN';
      const match = document.cookie.match(new RegExp('(^|; )' + xsrfCookieName + '=([^;]*)'));
      if (match) {
        const xsrfValue = decodeURIComponent(match[2]);
        config.headers[axiosInstance.defaults.xsrfHeaderName || 'X-XSRF-TOKEN'] = xsrfValue;
      }
    } catch (e) {
      // ignore in non-browser environments
    }

    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;