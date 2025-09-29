import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL || API_URL === '' || API_URL === window.location.origin) {
  API_URL = 'http://localhost:8080';
}

API_URL = API_URL.replace(/\/$/, '');

const axiosInstance = axios.create({
  baseURL: API_URL
});

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;