/**
 * API Client for PortMySim
 * Handles all API requests to the backend server
 */

// Base API URL - change this to your actual backend URL in production
const API_BASE_URL = 'http://localhost:5000/api';

// Auth token management
const TOKEN_KEY = 'portmysim_auth_token';
const USER_KEY = 'portmysim_user';

// Get the stored auth token
const getToken = () => localStorage.getItem(TOKEN_KEY);

// Get the stored user data
const getUser = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Store auth token and user data
const setAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Clear auth data on logout
const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// API request helper with authentication
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized by clearing auth and redirecting to login
      if (response.status === 401) {
        clearAuth();
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = '/HTML/login.html';
        }
      }
      
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API functions
const authAPI = {
  // Login user
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.success && data.token) {
      setAuth(data.token, data.user);
    }
    
    return data;
  },
  
  // Register user
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (data.success && data.token) {
      setAuth(data.token, data.user);
    }
    
    return data;
  },
  
  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/auth/me');
  },
  
  // Logout user
  logout: () => {
    clearAuth();
    // Redirect to home page after logout
    window.location.href = '/HTML/index.html';
  },
  
  // Request password reset
  forgotPassword: async (email) => {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  
  // Reset password with token
  resetPassword: async (resetToken, password) => {
    return await apiRequest(`/auth/reset-password/${resetToken}`, {
      method: 'PUT',
      body: JSON.stringify({ password })
    });
  }
};

// Export the API client
window.PortMySimAPI = {
  auth: authAPI,
  isAuthenticated,
  getUser
}; 