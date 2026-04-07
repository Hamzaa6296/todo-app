import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001', 
});

// Add a request interceptor to attach the JWT token
API.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;