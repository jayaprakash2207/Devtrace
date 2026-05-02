import api from './axios';

export const getDashboard = () =>
  api.get('/api/dashboard').then((r) => r.data);

export const getChartData = (days = 7) =>
  api.get('/api/activity/chart', { params: { days } }).then((r) => r.data);

export const logActivity = (action, sessionDuration = null, metadata = {}) =>
  api.post('/api/activity/log', { action, sessionDuration, metadata }).then((r) => r.data);

export const getActivity = (page = 1, limit = 10) =>
  api.get('/api/activity', { params: { page, limit } }).then((r) => r.data);
