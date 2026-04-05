import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cloudcost_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Cost APIs
export const costAPI = {
  summary: () => api.get('/costs/summary'),
  services: () => api.get('/costs/services'),
  addService: (data) => api.post('/costs/services', data),
  updateService: (id, data) => api.put(`/costs/services/${id}`, data),
  removeService: (id) => api.delete(`/costs/services/${id}`),
  daily: () => api.get('/costs/daily'),
  monthly: () => api.get('/costs/monthly'),
};

// Budget APIs
export const budgetAPI = {
  get: () => api.get('/budget'),
  update: (data) => api.put('/budget', data),
};

// Alerts API
export const alertAPI = {
  list: () => api.get('/alerts'),
};

// Recommendations API
export const recommendationAPI = {
  list: () => api.get('/recommendations'),
};

// Export APIs
export const exportAPI = {
  costs: (startDate, endDate) => api.post('/export/costs', { startDate, endDate }),
  billing: (startDate, endDate) => api.post('/export/billing', { startDate, endDate }),
  dateRange: () => api.get('/export/date-range'),
};

export default api;
