import axios from 'axios';

let logoutHandler = null;
export function setLogoutHandler(fn) {
  logoutHandler = fn;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 900000, // 15 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Auto-logout on network/server error or 401/403
    if (
      !error.response ||
      error.response.status === 401 ||
      error.response.status === 403
    ) {
      if (typeof logoutHandler === 'function') logoutHandler();
    }
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions for authentication
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
};

// API functions for complaints
export const complaintsAPI = {
  // Get all complaints with filtering and pagination
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/complaints?${params.toString()}`);
    return response.data;
  },

  // Get complaint statistics
  getStats: async () => {
    const response = await api.get('/complaints/stats');
    return response.data;
  },

  // Get complaint by ID
  getById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Create new complaint
  create: async (complaintData) => {
    const response = await api.post('/complaints', complaintData);
    return response.data;
  },

  // Update complaint
  update: async (id, updateData) => {
    const response = await api.put(`/complaints/${id}`, updateData);
    return response.data;
  },

  // Update complaint status
  updateStatus: async (id, status, resolution = null) => {
    const response = await api.patch(`/complaints/${id}/status`, { status, resolution });
    return response.data;
  },

  // Add comment to complaint
  addComment: async (id, comment) => {
    const response = await api.post(`/complaints/${id}/comments`, { comment });
    return response.data;
  },

  // Delete complaint
  delete: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  // Get urgent complaints for notifications
  getUrgent: async () => {
    const response = await api.get('/complaints/urgent');
    return response.data;
  },

  // Auto-escalate old complaints
  autoEscalate: async () => {
    const response = await api.post('/complaints/auto-escalate');
    return response.data;
  },
};

// API functions for users
export const usersAPI = {
  // Get all users with filtering and pagination
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Get user by ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  update: async (id, updateData) => {
    const response = await api.put(`/users/${id}`, updateData);
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Admin change password for another user
  adminChangePassword: async (userId, newPassword) => {
    const response = await api.post('/users/admin/change-password', { userId, newPassword });
    return response.data;
  },
};

// API functions for logs
export const logsAPI = {
  // Get all logs
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get(`/logs?${params.toString()}`);
    return response.data;
  },

  // Get log by ID
  getById: async (id) => {
    const response = await api.get(`/logs/${id}`);
    return response.data;
  },

  // Create new log
  create: async (logData) => {
    const response = await api.post('/logs', logData);
    return response.data;
  },
};

export default api; 