import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiClient = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      api.post('/api/auth/login', { email, password }),
    register: (name: string, email: string, password: string) =>
      api.post('/api/auth/register', { name, email, password }),
    me: () => api.get('/api/auth/me'),
  },
  
  // User endpoints
  users: {
    getAll: () => api.get('/api/users'),
    getById: (id: string) => api.get(`/api/users/${id}`),
    update: (id: string, data: any) => api.put(`/api/users/${id}`, data),
    delete: (id: string) => api.delete(`/api/users/${id}`),
  },
  
  // Membership endpoints
  memberships: {
    getAll: () => api.get('/api/memberships'),
    create: (data: any) => api.post('/api/memberships', data),
    update: (id: string, data: any) => api.put(`/api/memberships/${id}`, data),
    delete: (id: string) => api.delete(`/api/memberships/${id}`),
  },
  
  // Gym classes endpoints
  classes: {
    getAll: () => api.get('/api/classes'),
    getById: (id: string) => api.get(`/api/classes/${id}`),
    create: (data: any) => api.post('/api/classes', data),
    update: (id: string, data: any) => api.put(`/api/classes/${id}`, data),
    delete: (id: string) => api.delete(`/api/classes/${id}`),
  },
  
  // Bookings/Enrollments endpoints
  bookings: {
    create: (data: any) => api.post('/api/bookings', data),
    getUserBookings: (userId: string) => api.get(`/api/bookings/user/${userId}`),
    cancel: (id: string) => api.delete(`/api/bookings/${id}`),
  },
  
  // Dashboard endpoints
  dashboard: {
    getStats: () => api.get('/api/dashboard/stats'),
  },
};

export default api;
