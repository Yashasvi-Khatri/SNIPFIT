import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies
});

// Global variable to store access token in memory
let accessToken: string | null = null;
let authUserHint: { email: string; name?: string } | null = null;

// Function to set access token (called by AuthContext)
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

// Function to get current access token
export const getAccessToken = (): string | null => {
  return accessToken;
};

export const setAuthUserHint = (user: { email: string; name?: string } | null): void => {
  authUserHint = user;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (authUserHint?.email) {
      config.headers['X-Snipfit-User-Email'] = authUserHint.email;
    }
    if (authUserHint?.name) {
      config.headers['X-Snipfit-User-Name'] = authUserHint.name;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const requestUrl = error.config?.url || '';

    // `/api/auth/me` is used for bootstrap/profile sync, so a 401 there should not
    // immediately force a full auth reset during login.
    if (error.response?.status === 401 && requestUrl.includes('/api/admin')) {
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('snipfit:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiClient = {
  // Auth endpoints (simplified - Supabase handles auth)
  auth: {
    me: (token?: string) =>
      api.get('/api/auth/me', token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined),
    login: (data: { email: string; password: string }) =>
      api.post('/api/auth/login', data),
    register: (data: { email: string; name?: string }) =>
      api.post('/api/auth/register', data),
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
    getAll: (params?: { startDate?: string; endDate?: string; type?: string; trainerId?: string }) =>
      api.get('/api/classes', { params }),
    getById: (id: string) => api.get(`/api/classes/${id}`),
    create: (data: any) => api.post('/api/classes', data),
    book: (classId: string) => api.post(`/api/classes/${classId}/book`),
    cancelBooking: (classId: string) => api.delete(`/api/classes/${classId}/book`),
    getMyBookings: () => api.get('/api/classes/my-bookings'),
    update: (id: string, data: any) => api.patch(`/api/classes/${id}`, data),
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

  // Member endpoints
  members: {
    getDashboard: () => api.get('/api/members/me/dashboard'),
    getCard: () => api.get('/api/members/me/card'),
  },

  // Workout endpoints
  workouts: {
    getAll: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
      api.get('/api/workouts', { params }),
    getById: (id: string) => api.get(`/api/workouts/${id}`),
    getStats: () => api.get('/api/workouts/stats'),
    create: (data: any) => api.post('/api/workouts', data),
    update: (id: string, data: any) => api.patch(`/api/workouts/${id}`, data),
    delete: (id: string) => api.delete(`/api/workouts/${id}`),
  },

  // Measurement endpoints
  measurements: {
    getAll: () => api.get('/api/measurements'),
    getLatest: () => api.get('/api/measurements/latest'),
    create: (data: any) => api.post('/api/measurements', data),
    delete: (id: string) => api.delete(`/api/measurements/${id}`),
  },

  // Admin endpoints
  admin: {
    getStats: () => api.get('/api/admin/stats'),
    getMembers: (params?: { page?: number; limit?: number; q?: string; plan?: string; status?: string; sort?: string; order?: string }) =>
      api.get('/api/admin/members', { params }),
    getExpiring: () => api.get('/api/admin/members/expiring'),
    updateRole: (id: string, role: string) => api.patch(`/api/admin/members/${id}/role`, { role }),
    updateMembership: (id: string, data: any) => api.patch(`/api/admin/members/${id}/membership`, data),
    deleteMember: (id: string) => api.delete(`/api/admin/members/${id}`),
    getMonthlyRevenue: () => api.get('/api/admin/revenue/monthly'),
  },

  // Admin Auth endpoints
  adminAuth: {
    verifySecurityCode: (email: string, securityCode: string) =>
      api.post('/api/admin-auth/verify-security-code', { email, securityCode }),
    setSecurityCode: (userId: string, currentCode: string | undefined, newCode: string) =>
      api.post('/api/admin-auth/set-security-code', { userId, currentCode, newCode }),
    getLoginHistory: (userId: string) =>
      api.get(`/api/admin-auth/login-history/${userId}`),
  },

  // Contact form (public)
  contact: {
    submit: (data: {
      name: string;
      email: string;
      phone?: string;
      interest: string;
      message?: string;
    }) => api.post('/api/contact', data),
  },
};

export default api;
