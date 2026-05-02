import api from './axios';

export async function sendMessage(message, history = []) {
  const { data } = await api.post('/api/chat', { message, history });
  return data;
}
