import axios from 'axios';

// Base Axios Instance connected to the Spring Boot backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor (Auth Tokens)
api.interceptors.request.use(
  (config) => {
    const session = JSON.parse(sessionStorage.getItem('session') || '{}');
    if (session && session.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res && res.success !== undefined && res.data !== undefined) {
      return res.data;
    }
    return res;
  },
  (error) => {
    console.error('API Error:', error.response || error.message);
    if (error.response && error.response.status === 401) {
       if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          sessionStorage.removeItem('session');
          window.location.href = '/login';
       }
    }
    if (error.response && error.response.status === 403) {
       console.error("Unauthorized access to this resource.");
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const AuthService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Employee Portal Services
export const EmployeePortalService = {
  getDashboardStats: () => api.get('/employee/dashboard/stats'),
  getAvailableAssets: () => api.get('/employee/assets'),
  getMyAssets: () => api.get('/employee/issued-assets'),
  getMyRequests: () => api.get('/employee/requests'),
  requestAsset: (data) => api.post('/employee/requests', data),
  returnAsset: (data) => api.post('/employee/returns', data),
  getMyComplaints: () => api.get('/employee/complaints'),
  fileComplaint: (data) => api.post('/employee/complaints', data)
};

// Issuer Services
export const IssuerService = {
  getDashboardStats: () => api.get('/issuer/dashboard/stats'),
  getPendingRequests: () => api.get('/issuer/requests'),
  processRequest: (id, data) => api.put(`/issuer/requests/${id}`, data),
  getPendingReturns: () => api.get('/issuer/returns'),
  processReturn: (id, data) => api.put(`/issuer/returns/${id}`, data),
  searchEmployees: (query) => api.get(`/issuer/search/employees?query=${query}`),
  searchAssets: (query) => api.get(`/issuer/search/assets?query=${query}`),
  issueAsset: (data) => api.post('/issuer/issue-asset', data),
  directReturnAsset: (data) => api.post('/issuer/return-asset', data),
  getIssueHistory: () => api.get('/issuer/history/issues'),
  getReturnHistory: () => api.get('/issuer/history/returns')
};

// Notification Services
export const NotificationService = {
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`)
};

// User & Issuer Management Services
export const UserService = {
  getUsers: (params) => api.get('/users', { params }),
  createIssuer: (data) => api.post('/users/issuers', data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

// Employee Management Services
export const EmployeeService = {
  getAll: (params) => api.get('/employees', { params: { size: 1000, ...params } }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Modular API Services Prepared for Backend Endpoints
export const AssetService = {
  getAll: (params) => api.get('/assets', { params: { size: 1000, sort: 'id,desc', ...params } }),
  getById: (id) => api.get(`/assets/${id}`),
  getByCode: (code) => api.get(`/assets/code/${code}`),
  getHistory: (id) => api.get(`/assets/${id}/history`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  assign: (id, data) => api.post(`/assets/${id}/assign`, data),
  return: (id, data) => api.post(`/assets/${id}/return`, data),
  reserve: (id, data) => api.post(`/assets/${id}/reserve`, data),
  export: (format) => api.get(`/assets/export?format=${format}`, { responseType: 'blob' }),
};

export const CategoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const VendorService = {
  getAll: () => api.get('/vendors'),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

export const DepartmentService = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
};

export const MaintenanceService = {
  getAll: () => api.get('/maintenances'),
  create: (data) => api.post('/maintenances', data),
  updateStatus: (id, status) => api.patch(`/maintenances/${id}`, { status }),
};

export const ReportService = {
  generate: (type, format) => api.post('/reports/generate', { type, format }),
};

export const DashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const ActivityLogService = {
  getAll: () => api.get('/logs'),
};

export const AuditService = ActivityLogService;

export default api;
