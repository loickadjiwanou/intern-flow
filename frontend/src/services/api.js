import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/users/me'),
};

export const internsAPI = {
  getAll: (params) => api.get('/interns', { params }),
  getById: (id) => api.get(`/interns/${id}`),
  create: (data) => api.post('/interns', data),
  update: (id, data) => api.put(`/interns/${id}`, data),
  delete: (id) => api.delete(`/interns/${id}`),
  getStats: () => api.get('/interns/stats/overview'),
};

export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
};

export const evaluationsAPI = {
  getAll: (params) => api.get('/evaluations', { params }),
  getById: (id) => api.get(`/evaluations/${id}`),
  create: (data) => api.post('/evaluations', data),
  update: (id, data) => api.put(`/evaluations/${id}`, data),
  delete: (id) => api.delete(`/evaluations/${id}`),
};

export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  review: (id, data) => api.post(`/reports/${id}/review`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const recruitmentAPI = {
  getJobs: () => api.get('/recruitment/jobs'),
  createJob: (data) => api.post('/recruitment/jobs', data),
  getApplications: (params) => api.get('/recruitment/applications', { params }),
  createApplication: (data) => api.post('/recruitment/applications', data),
  updateApplication: (id, data) => api.put(`/recruitment/applications/${id}`, data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const messagesAPI = {
  getAll: () => api.get('/messages'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  send: (data) => api.post('/messages', data),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
};

export const documentsAPI = {
  getAll: (params) => api.get('/documents', { params }),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getPerformance: () => api.get('/analytics/performance'),
  getStats: () => api.get('/analytics/stats'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  updateSMTP: (data) => api.put('/settings/smtp', data),
  testEmail: (data) => api.post('/settings/test-email', data),
  getTemplates: () => api.get('/settings/templates'),
  initDefaultTemplates: () => api.post('/settings/templates/init-defaults'),
  createTemplate: (data) => api.post('/settings/templates', data),
  updateTemplate: (id, data) => api.put(`/settings/templates/${id}`, data),
  updateAutomation: (data) => api.put('/settings/automation', data),
};

export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const auditLogsAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
};

export const searchAPI = {
  search: (query) => api.get('/search', { params: { q: query } }),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
