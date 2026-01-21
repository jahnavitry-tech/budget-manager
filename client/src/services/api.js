import axios from 'axios';

// Detect environment and set API base URL
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5001/api'  // Local development
  : 'https://budget-manager-backend-5m32.onrender.com/api';  // Production - REPLACE with your actual Render URL

console.log('API Base URL:', API_BASE_URL, 'Environment:', isDevelopment ? 'development' : 'production');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getRecent: () => api.get('/transactions/recent'),
  getByDateRange: (startDate, endDate) => 
    api.get(`/transactions/date-range?start=${startDate}&end=${endDate}`)
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  getDefault: () => api.get('/categories/default')
};

// Budgets API
export const budgetsAPI = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getCurrentLimits: () => api.get('/budgets/current-limits')
};

// Reports API
export const reportsAPI = {
  getMonthlySummary: (year, month) => 
    api.get(`/reports/monthly-summary/${year}/${month}`),
  getAnnualSummary: (year) => 
    api.get(`/reports/annual-summary/${year}`),
  getCategoryBreakdown: (startDate, endDate) => 
    api.get(`/reports/category-breakdown?start=${startDate}&end=${endDate}`),
  getSpendingTrends: (months = 6) => 
    api.get(`/reports/spending-trends?months=${months}`)
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/reports/dashboard-overview'),
  getQuickStats: () => api.get('/reports/quick-stats'),
  getRecentActivity: () => api.get('/reports/recent-activity')
};

export default api;