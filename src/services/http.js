import axios from 'axios';

/** Shared Axios client for all implemented Spring Boot endpoints. */
export const http = axios.create({ baseURL: 'http://localhost:8080/api' });

/** Adds the current JWT to every protected backend request. */
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('orchasp-token') || sessionStorage.getItem('orchasp-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
