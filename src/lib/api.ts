// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/api/login', { email, password }),
  signup: (data: any) => api.post('/api/signup', data),
  getMe: () => api.get('/api/me'),
  logout: () => api.post('/api/logout'),
};

export const stadiumsAPI = {
  getAll: (filters?: any) => api.get('/api/stadiums', { params: filters }),
  getById: (id: string) => api.get(`/api/stadiums/${id}`),
  getSlots: (id: string, date: string) => 
    api.get(`/api/stadiums/${id}/slots`, { params: { date } }),
  create: (data: any) => api.post('/api/owner/stadiums', data),
  update: (id: string, data: any) => api.put(`/api/owner/stadiums/${id}`, data),
  getOwnerStadiums: () => api.get('/api/owner/stadiums'),
  generateSlots: (stadiumId: string, data: any) => 
    api.post(`/api/owner/stadiums/${stadiumId}/generate-slots`, data),
};

export const bookingsAPI = {
  create: (data: any) => api.post('/api/bookings', data),
  getMyBookings: (status?: string) => api.get('/api/bookings/me', { params: { status } }),
  cancel: (id: string) => api.delete(`/api/bookings/${id}/cancel`),
  confirm: (id: string) => api.post(`/api/owner/bookings/${id}/confirm`),
  getStadiumBookings: (stadiumId: string, filters?: any) => 
    api.get(`/api/owner/stadiums/${stadiumId}/bookings`, { params: filters }),
};

export const codesAPI = {
  validate: (code: string, stadium_id: string) => 
    api.post('/api/codes/validate', { code, stadium_id }),
  generate: (data: any) => api.post('/api/admin/codes/generate', data),
};

export const adminAPI = {
  getStats: () => api.get('/api/admin/dashboard/stats'),
  getUsers: (role?: string) => api.get('/api/admin/users', { params: { role } }),
  getPendingManagers: () => api.get('/api/admin/managers/pending'),
  approveManager: (userId: string) => api.post(`/api/admin/managers/${userId}/approve`),
  assignEmployee: (data: any) => api.post('/api/admin/employees/assign', data),
  getSystemLogs: () => api.get('/api/admin/activity-logs'),
};

export const employeeAPI = {
  getStadiums: () => api.get('/api/employee/stadiums'),
};

export default api;
