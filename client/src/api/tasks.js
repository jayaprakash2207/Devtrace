import api from './axios';

export const getTasks = (params) => api.get('/api/tasks', { params }).then((r) => r.data);
export const createTask = (data) => api.post('/api/tasks', data).then((r) => r.data);
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`).then((r) => r.data);
