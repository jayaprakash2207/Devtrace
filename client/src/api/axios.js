import axios from 'axios';

// In development the Vite proxy rewrites /api/* → localhost:5000/api/*,
// so baseURL stays empty.  In production set VITE_API_URL to your Render/
// Railway backend URL (e.g. https://devtrace-api.onrender.com) and all
// /api/* calls will go there directly.
const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE,
  timeout: 12000,
});

// Attach auth + session headers on every request
api.interceptors.request.use((config) => {
  const token   = localStorage.getItem('dt_token');
  const session = localStorage.getItem('dt_session');
  if (token)   config.headers.Authorization   = `Bearer ${token}`;
  if (session) config.headers['x-session-id'] = session;
  return config;
});

// Global 401 → clear credentials and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dt_token');
      localStorage.removeItem('dt_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Persist a stable per-browser session ID for activity correlation
if (!localStorage.getItem('dt_session')) {
  localStorage.setItem('dt_session', crypto.randomUUID());
}

export default api;
