import api from './axios';

export const getNotes    = (params)     => api.get('/api/notes', { params }).then((r) => r.data);
export const getNote     = (id)         => api.get(`/api/notes/${id}`).then((r) => r.data);
export const createNote  = (data)       => api.post('/api/notes', data).then((r) => r.data);
export const updateNote  = (id, data)   => api.put(`/api/notes/${id}`, data).then((r) => r.data);
export const deleteNote  = (id)         => api.delete(`/api/notes/${id}`).then((r) => r.data);
