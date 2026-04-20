import axios from 'axios';
import { clearAuthCookies } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', data.access);
          if (typeof document !== 'undefined') {
            document.cookie = `access_token=${data.access}; path=/; max-age=900; samesite=lax`;
          }
          originalRequest.headers.Authorization = `JWT ${data.access}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          clearAuthCookies();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
