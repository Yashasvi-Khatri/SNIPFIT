import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies
});

// Global variable to store access token in memory
let accessToken: string | null = null;

// Function to set access token (called by AuthContext)
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

// Function to get current access token
export const getAccessToken = (): string | null => {
  return accessToken;
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

// Function to add subscriber for token refresh
const subscribeTokenRefresh = (callback: (token: string | null) => void): void => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers
const onTokenRefreshed = (token: string | null): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for the refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string | null) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/api/auth/refresh');
        
        if (refreshResponse.data.success && refreshResponse.data.accessToken) {
          const newAccessToken = refreshResponse.data.accessToken;
          setAccessToken(newAccessToken);
          onTokenRefreshed(newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - notify subscribers and clear token
        setAccessToken(null);
        onTokenRefreshed(null);
        
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
    register: (name: string, email: string, password: string, phone?: string) =>
      api.post('/api/auth/register', { name, email, password, phone }),
    refresh: () => api.post('/api/auth/refresh'),
    logout: () => api.post('/api/auth/logout'),
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
