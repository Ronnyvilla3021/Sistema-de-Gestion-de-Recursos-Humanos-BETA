import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token en cada petición
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

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Employee services
export const employeeService = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats')
};

// Attendance services
export const attendanceService = {
  checkIn: (employee_id) => api.post('/attendance/check-in', { employee_id }),
  checkOut: (employee_id) => api.post('/attendance/check-out', { employee_id }),
  getByEmployee: (employee_id, params) => api.get(`/attendance/employee/${employee_id}`, { params }),
  getSummary: (params) => api.get('/attendance/summary', { params }),
  getAll: (params) => api.get('/attendance', { params }),
  create: (data) => api.post('/attendance', data)
};

// Payroll services
export const payrollService = {
  generate: (data) => api.post('/payroll/generate', data),
  generateBatch: (data) => api.post('/payroll/generate-batch', data),
  getAll: (params) => api.get('/payroll', { params }),
  getByEmployee: (employee_id) => api.get(`/payroll/employee/${employee_id}`),
  approve: (id, data) => api.put(`/payroll/${id}/approve`, data),
  delete: (id) => api.delete(`/payroll/${id}`),  // ← AGREGAR ESTA LÍNEA
  getSettings: () => api.get('/payroll/settings'),
  updateSettings: (data) => api.put('/payroll/settings', data)
};

// Leave services
export const leaveService = {
  create: (data) => api.post('/leave', data),
  getAll: (params) => api.get('/leave', { params }),
  review: (id, data) => api.put(`/leave/${id}/review`, data),
  getVacationBalance: (employee_id, params) => api.get(`/leave/vacation-balance/${employee_id}`, { params }),
  getAllBalances: (params) => api.get('/leave/vacation-balances', { params }),
  getCalendar: (params) => api.get('/leave/calendar', { params })
};

// Reports services
export const reportsService = {
  getAnalytics: () => api.get('/reports/analytics'),
  getAttendance: (params) => api.get('/reports/attendance', { params }),
  getPayroll: (params) => api.get('/reports/payroll', { params }),
  getDepartments: () => api.get('/reports/departments'),
  getTurnover: (params) => api.get('/reports/turnover', { params })
};

export default api;