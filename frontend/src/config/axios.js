import axios from 'axios';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : (import.meta.env.VITE_API_URL || 'https://chatraj-backend.onrender.com/api');

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