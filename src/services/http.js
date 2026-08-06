import axios from 'axios';
import { toast } from 'sonner';

/** Shared Axios client for all implemented Spring Boot endpoints. */
export const http = axios.create({ baseURL: 'http://localhost:8080/api' });

/** Adds the current JWT to every protected backend request. */
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('orchasp-token') || sessionStorage.getItem('orchasp-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalizes backend/network failures into consistent toast messages. */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only surface a toast for unexpected failures (not 4xx validation the UI already handles).
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.response?.data?.error || error?.message;
    if (status >= 500 || !status) {
      toast.error(message || 'Something went wrong. Please try again.');
    }
    return Promise.reject(error);
  }
);
