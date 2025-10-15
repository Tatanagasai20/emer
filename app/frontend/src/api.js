import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', new URLSearchParams(credentials), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  getMe: () => api.get('/api/auth/me'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// Employee APIs
export const employeeAPI = {
  create: (data) => api.post('/api/employees', data),
  getAll: (domain = null) => api.get('/api/employees', { params: { domain } }),
  getById: (id) => api.get(`/api/employees/${id}`),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`),
  getDomains: () => api.get('/api/domains'),
};

// Attendance APIs
export const attendanceAPI = {
  checkIn: (data) => api.post('/api/attendance/check-in', data),
  checkOut: (data) => api.post('/api/attendance/check-out', data),
  getMyHistory: (startDate, endDate) => api.get('/api/attendance/my-history', {
    params: { start_date: startDate, end_date: endDate }
  }),
  getToday: () => api.get('/api/attendance/today'),
  getReports: (startDate, endDate, domain, employeeId) => api.get('/api/attendance/reports', {
    params: { start_date: startDate, end_date: endDate, domain, employee_id: employeeId }
  }),
};

// Leave APIs
export const leaveAPI = {
  apply: (data) => api.post('/api/leaves/apply', data),
  getMyLeaves: () => api.get('/api/leaves/my-leaves'),
  getAll: (status) => api.get('/api/leaves/all', { params: { status } }),
  updateStatus: (id, status) => api.put(`/api/leaves/${id}/status`, null, { params: { status } }),
};

// Holiday APIs
export const holidayAPI = {
  create: (data) => api.post('/api/holidays', data),
  getAll: (year) => api.get('/api/holidays', { params: { year } }),
  delete: (id) => api.delete(`/api/holidays/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default api;
