import axios from 'axios';

// Use env variable in production, localhost in development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/admin';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Handle expired/invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  login: (email, password) =>
    api.post('/login', { email, password }),
  register: (name, email, password, role) =>
    api.post('/register', { name, email, password, role }),
};

// ===== DASHBOARD =====
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

// ===== MATCHES =====
export const matchesAPI = {
  getAll: (status, page) =>
    api.get('/matches', { params: { status, page, limit: 10 } }),
  create: (matchData) => api.post('/matches', matchData),
  update: (id, data) => api.put(`/matches/${id}`, data),
  updateScore: (id, scoreData) =>
    api.put(`/matches/${id}/score`, scoreData),
  delete: (id) => api.delete(`/matches/${id}`),
};

// ===== TEAMS =====
export const teamsAPI = {
  getAll: (page) => api.get('/teams', { params: { page, limit: 10 } }),
  create: (formData) =>
    api.post('/teams', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/teams/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/teams/${id}`),
};

// ===== PLAYERS =====
export const playersAPI = {
  getAll: (filters, page) =>
    api.get('/players', { params: { ...filters, page, limit: 10 } }),
  getById: (id) => api.get(`/players/${id}`),
  create: (formData) =>
    api.post('/players', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/players/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/players/${id}`),
};

// ===== USERS =====
export const usersAPI = {
  getAll: (page) => api.get('/users', { params: { page, limit: 10 } }),
  create: (userData) => api.post('/users', userData),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ===== SETTINGS =====
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// ===== ACTIVITY LOGS =====
export const logsAPI = {
  getAll: (page) => api.get('/activity-logs', { params: { page, limit: 20 } }),
};

export default api;
