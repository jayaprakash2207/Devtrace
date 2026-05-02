import api from './axios';

export const signup        = (data) => api.post('/api/auth/signup',   data).then((r) => r.data);
export const login         = (data) => api.post('/api/auth/login',    data).then((r) => r.data);
export const me            = ()     => api.get('/api/auth/me').then((r) => r.data);
export const updateProfile = (data) => api.patch('/api/auth/profile', data).then((r) => r.data);
