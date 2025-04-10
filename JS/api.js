/**
 * API Client for PortMySim
 * Handles all API requests to the backend server
 */

// Define configuration directly - no imports needed
const API_CONFIG = {
  NUMLOOKUP_API_KEY: 'your_api_key_here',
  GOOGLE_MAPS_API_KEY: 'your_api_key_here'
};
const CONFIG = API_CONFIG;

// Base API URL - change this to your actual backend URL in production
const DEFAULT_PORT = 5000;
let API_BASE_URL = `http://localhost:${DEFAULT_PORT}/api`;
let API_PORT_DETECTED = false;

// Config for port detection
const PORT_DETECTION_CONFIG = {
  // Only try the most likely ports
  portsToTry: [5000], // Focus on the one port we know is used
  timeoutMs: 2000,   // Shorter timeout
  retryCount: 1,     // Only try once per port
  retryDelayMs: 0    // No delay between retries
};

// Disable port detection entirely - just use port 5000
// Using DEFAULT_PORT defined at the top of the file
async function detectApiPort() {
  if (API_PORT_DETECTED) {
    return API_BASE_URL;
  }
  
  for (const port of PORT_DETECTION_CONFIG.portsToTry) {
    const testUrl = `http://localhost:${port}/api/auth/ping`;
    try {
      const response = await fetch(testUrl, {
        timeout: PORT_DETECTION_CONFIG.timeoutMs
      });
      
      if (response.ok) {
        API_BASE_URL = `http://localhost:${port}/api`;
        API_PORT_DETECTED = true;
        console.log(`Detected API running on port ${port}`);
        return API_BASE_URL;
      }
    } catch (error) {
      console.log(`API not detected on port ${port}`);
    }
  }
  
  // If no port detected, use default
  console.log(`No API port detected, using default: ${DEFAULT_PORT}`);
  return API_BASE_URL;
}

// Add a function to check server connectivity
async function testServerConnection() {
  try {
    console.log('Testing server connection to:', API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/auth/ping`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('Server connection successful');
      return true;
    }
    
    console.warn('Server connection failed with status:', response.status);
    return false;
  } catch (error) {
    console.error('Server connectivity test failed:', error);
    return false;
  }
}

// Test the connection when the script loads
testServerConnection();

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
  console.log('API request to:', url);
  
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

    // Handle HTTP errors
    if (!response.ok) {
      // Check for 401 Unauthorized (expired token)
      if (response.status === 401 && token) {
        // Clear the invalid token
        clearAuth();
        // Redirect to login if needed
        if (window.location.pathname !== '/HTML/login.html' && 
            window.location.pathname !== '/index.html') {
          window.location.href = '/HTML/login.html?session_expired=true';
          return { success: false, message: 'Session expired, please log in again.' };
        }
      }
      
      // For other errors, parse response JSON if possible
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, create error object
        return {
          success: false,
          message: `API error: ${response.status} ${response.statusText}`,
          statusCode: response.status
        };
      }
      return errorJson;
    }

    // Parse successful response
    const text = await response.text();
    
    // Handle empty responses
    if (!text) {
      return { success: true };
    }
    
    // Parse JSON response
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Error parsing response:', e);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.'
    };
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
  
  // Verify email with token
  verifyEmail: async (token) => {
    return await apiRequest(`/auth/verify-email/${token}`, {
      method: 'GET'
    });
  },
  
  // Resend verification email
  resendVerification: async (data) => {
    return await apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // Update user profile
  updateProfile: async (data) => {
    return await apiRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // Update user email
  updateEmail: async (data) => {
    return await apiRequest('/auth/update-email', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // Update user password
  updatePassword: async (data) => {
    return await apiRequest('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // Delete user account
  deleteAccount: async (data) => {
    return await apiRequest('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify(data)
    });
  },
  
  // Login or register with Google
  googleAuth: async (data) => {
    const response = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.success && response.token) {
      setAuth(response.token, response.user);
    }
    
    return response;
  },
  
  // Login or register with Facebook
  facebookAuth: async (data) => {
    const response = await apiRequest('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.success && response.token) {
      setAuth(response.token, response.user);
    }
    
    return response;
  },
  
  // Request password reset
  forgotPassword: async (email) => {
    console.log('Forgot password request for:', email);
    
    // Ensure we have the correct port
    await detectApiPort();
    
    try {
      // Log the full request URL for debugging
      const url = `${API_BASE_URL}/auth/forgot-password`;
      console.log('Full request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Check if response looks like HTML
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Server returned HTML instead of JSON. The auth API route may not be configured correctly.');
        
        return {
          success: false,
          message: 'Password reset system is currently unavailable. Please try again later or contact support.'
        };
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('Error parsing response as JSON:', err);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        console.error('Error response:', data);
        return {
          success: false,
          message: data.message || 'Failed to send password reset email.'
        };
      }
      
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      };
    }
  },
  
  // Reset password with token
  resetPassword: async (resetToken, password) => {
    console.log('Attempting to reset password with token:', resetToken);
    
    // Ensure we have the correct port
    await detectApiPort();
    
    try {
      // Log the full request URL for debugging
      const url = `${API_BASE_URL}/auth/reset-password/${resetToken}`;
      console.log('Full request URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Check if response looks like HTML
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Server returned HTML instead of JSON. The auth API route may not be configured correctly.');
        
        return {
          success: false,
          message: 'Password reset system is currently unavailable. Please try again later or contact support.'
        };
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('Error parsing response as JSON:', err);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        console.error('Error response:', data);
        return {
          success: false,
          message: data.message || 'Failed to reset password. The link may have expired or is invalid.'
        };
      }
      
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Failed to reset password. The link may have expired or is invalid.'
      };
    }
  }
};

/**
 * Compare multiple plans side by side
 * @param {string[]} planIds - Array of plan IDs to compare
 * @returns {Promise<Object>} Comparison results
 */
async function comparePlans(planIds) {
  if (!planIds || !Array.isArray(planIds) || planIds.length < 2) {
    throw new Error('At least 2 plan IDs are required for comparison');
  }

  if (planIds.length > 3) {
    throw new Error('Maximum 3 plans can be compared at once');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/plans/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ planIds }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to compare plans');
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Plan comparison request timed out');
      throw new Error('Request timed out. Please try again.');
    }

    console.error('Error comparing plans:', error);
    
    // Fallback to local comparison if server request fails
    try {
      const plans = await Promise.all(planIds.map(id => getPlanById(id)));
      return {
        plans,
        valueScores: plans.map(plan => ({
          id: plan._id,
          score: plan.calculateValueScore()
        })),
        features: {
          daily_data: determineBestFeature(plans, 'data_value', 'highest'),
          validity: determineBestFeature(plans, 'validity', 'highest'),
          price: determineBestFeature(plans, 'price', 'lowest'),
          coverage: determineBestFeature(plans, 'network_coverage', 'highest'),
          speed: determineBestFeature(plans, 'data_speed', 'highest'),
          has_5g: plans.map(plan => plan.has_5g),
          subscriptions: plans.map(plan => plan.subscriptions.length)
        },
        summary: generateComparisonSummary(plans)
      };
    } catch (fallbackError) {
      console.error('Local comparison fallback failed:', fallbackError);
      throw new Error('Failed to compare plans. Please try again later.');
    }
  }
}

// Initialize the PortMySimAPI object
window.PortMySimAPI = {
    auth: authAPI,
    getApiBaseUrl: () => API_BASE_URL,
    detectApiPort,
    testServerConnection,
    isAuthenticated,
    getToken,
    getUser,
    setAuth,
    clearAuth,
    compareNetworks,
    fetchNetworkCoverage,
    getLocationsWithCoverage,
    comparePlans,
    fetchPlans,
    fetchPlansByOperator,
    fetchRecommendedPlans
};

/**
 * API utilities for fetching data from the backend
 */

/**
 * Fetch all plans with optional filtering
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise} - Resolves to plans data
 */
async function fetchPlans(filters = {}) {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/plans${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching plans: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Fetch plans by operator
 * @param {string} operator - Operator name (jio, airtel, vi, bsnl)
 * @returns {Promise} - Resolves to plans data for the operator
 */
async function fetchPlansByOperator(operator) {
  try {
    console.log(`Fetching plans for operator: ${operator}`);
    const url = `${API_BASE_URL}/operators/${operator}/plans`;
    console.log(`Request URL: ${url}`);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      
      // For 500 or 404 errors, fall back to local processing
      if (response.status === 500 || response.status === 404) {
        console.warn(`Server error occurred, falling back to local ${operator} plans data`);
        return getLocalOperatorPlans(operator);
      }
      
      throw new Error(`Error fetching operator plans: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Plans data received:', data);
    
    // Ensure we return an array
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.plans && Array.isArray(data.plans)) {
      return data.plans;
    } else {
      console.warn('API did not return an array of plans, defaulting to local data');
      return getLocalOperatorPlans(operator);
    }
  } catch (error) {
    console.error('API Error:', error);
    console.warn(`Using local fallback data for ${operator} plans`);
    return getLocalOperatorPlans(operator);
  }
}

/**
 * Get local plans by operator when API fails
 * @param {string} operator - Operator name
 * @returns {Array} - Array of plans for the operator
 */
function getLocalOperatorPlans(operator) {
  // Local plans data by operator
  const localPlans = {
    'jio': [
      { 
        name: 'Jio Basic Plan', 
        price: 179, 
        data: '1GB/day',
        data_value: 30,
        validity: 28,
        validity_category: 'monthly',
        has_5g: true,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: ['JioTV', 'JioCinema'],
        network_coverage: 93,
        data_speed: 35,
        plan_type: 'prepaid',
        data_category: 'low',
        price_category: 'budget',
        operator: 'jio',
        image: '../images/jio.jpeg'
      },
      { 
        name: 'Jio Standard Plan', 
        price: 299, 
        data: '2GB/day',
        data_value: 60,
        validity: 28,
        validity_category: 'monthly',
        has_5g: true,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: ['JioTV', 'JioCinema', 'JioCloud'],
        network_coverage: 96,
        data_speed: 60,
        plan_type: 'prepaid',
        data_category: 'medium',
        price_category: 'mid',
        operator: 'jio',
        image: '../images/jio.jpeg'
      },
      { 
        name: 'Jio Premium Plan', 
        price: 549, 
        data: '2GB/day',
        data_value: 60,
        validity: 84,
        validity_category: 'quarterly',
        has_5g: true,
        voice_calls: 'Unlimited',
        sms: 'Unlimited',
        subscriptions: ['JioTV', 'JioCinema', 'JioCloud', 'Disney+ Hotstar'],
        network_coverage: 98,
        data_speed: 80,
        plan_type: 'prepaid',
        data_category: 'medium',
        price_category: 'premium',
        operator: 'jio',
        image: '../images/jio.jpeg'
      }
    ],
    'airtel': [
      { 
        name: 'Airtel Basic Plan', 
        price: 199, 
        data: '1.5GB/day',
        data_value: 45,
        validity: 28,
        validity_category: 'monthly',
        has_5g: true,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: ['Amazon Prime Subscription', 'Wynk Music'],
        network_coverage: 95,
        data_speed: 40,
        plan_type: 'prepaid',
        data_category: 'medium',
        price_category: 'budget',
        operator: 'airtel',
        image: '../images/airtel.png'
      },
      { 
        name: 'Airtel Standard Plan', 
        price: 349, 
        data: '2.5GB/day',
        data_value: 75,
        validity: 28,
        validity_category: 'monthly',
        has_5g: true,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: ['Amazon Prime Subscription', 'Wynk Music', 'Airtel Xstream Premium'],
        network_coverage: 97,
        data_speed: 70,
        plan_type: 'prepaid',
        data_category: 'high',
        price_category: 'mid',
        operator: 'airtel',
        image: '../images/airtel.png'
      },
      { 
        name: 'Airtel Premium Plan', 
        price: 599, 
        data: '3GB/day',
        data_value: 90,
        validity: 84,
        validity_category: 'quarterly',
        has_5g: true,
        voice_calls: 'Unlimited',
        sms: 'Unlimited',
        subscriptions: ['Amazon Prime Subscription', 'Disney+ Hotstar', 'Wynk Music', 'Airtel Xstream Premium'],
        network_coverage: 99,
        data_speed: 100,
        plan_type: 'prepaid',
        data_category: 'high',
        price_category: 'premium',
        operator: 'airtel',
        image: '../images/airtel.png'
      }
    ],
    'vi': [
      { 
        name: 'Vi Basic Plan', 
        price: 189, 
        data: '1.5GB/day',
        data_value: 45,
        validity: 28,
        validity_category: 'monthly',
        has_5g: false,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: ['Vi Movies & TV'],
        network_coverage: 85,
        data_speed: 30,
        plan_type: 'prepaid',
        data_category: 'medium',
        price_category: 'budget',
        operator: 'vi',
        image: '../images/vi.png'
      },
      { 
        name: 'Vi Standard Plan', 
        price: 319, 
        data: '2GB/day',
        data_value: 60,
        validity: 28,
        validity_category: 'monthly',
        has_5g: false,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: ['Vi Movies & TV'],
        network_coverage: 90,
        data_speed: 45,
        plan_type: 'prepaid',
        data_category: 'medium',
        price_category: 'mid',
        operator: 'vi',
        image: '../images/vi.png'
      },
      { 
        name: 'Vi Premium Plan', 
        price: 499, 
        data: '3GB/day',
        data_value: 90,
        validity: 70,
        validity_category: 'quarterly',
        has_5g: true,
        voice_calls: 'Unlimited',
        sms: 'Unlimited',
        subscriptions: ['Vi Movies & TV', 'Mobile Insurance'],
        network_coverage: 92,
        data_speed: 60,
        plan_type: 'prepaid',
        data_category: 'high',
        price_category: 'premium',
        operator: 'vi',
        image: '../images/vi.png'
      }
    ],
    'bsnl': [
      { 
        name: 'BSNL Basic Plan', 
        price: 149, 
        data: '1GB/day',
        data_value: 30,
        validity: 28,
        validity_category: 'monthly',
        has_5g: false,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: [],
        network_coverage: 85,
        data_speed: 20,
        plan_type: 'prepaid',
        data_category: 'low',
        price_category: 'budget',
        operator: 'bsnl',
        image: '../images/bsnl.png'
      },
      { 
        name: 'BSNL Standard Plan', 
        price: 279, 
        data: '2GB/day',
        data_value: 60,
        validity: 84,
        validity_category: 'quarterly',
        has_5g: false,
        voice_calls: 'Unlimited',
        sms: '100/day',
        subscriptions: [],
        network_coverage: 85,
        data_speed: 20,
        plan_type: 'prepaid',
        data_category: 'medium',
        price_category: 'mid',
        operator: 'bsnl',
        image: '../images/bsnl.png'
      },
      { 
        name: 'BSNL Premium Plan', 
        price: 399, 
        data: '3GB/day',
        data_value: 90,
        validity: 90,
        validity_category: 'quarterly',
        has_5g: false,
        voice_calls: 'Unlimited',
        sms: 'Unlimited',
        subscriptions: [],
        network_coverage: 85,
        data_speed: 20,
        plan_type: 'prepaid',
        data_category: 'high',
        price_category: 'premium',
        operator: 'bsnl',
        image: '../images/bsnl.png'
      }
    ]
  };
  
  // Return plans for the requested operator or empty array if not found
  const operatorPlans = localPlans[operator.toLowerCase()] || [];
  console.log(`Generated ${operatorPlans.length} local plans for ${operator}`);
  
  return operatorPlans;
}

/**
 * Fetch similar plans 
 * @param {Object} params - Search parameters
 * @returns {Promise} - Resolves to similar plans data
 */
async function fetchSimilarPlans({ planId, priceRange, operator }) {
  try {
    const queryParams = new URLSearchParams();
    if (planId) queryParams.append('planId', planId);
    if (priceRange) queryParams.append('priceRange', priceRange);
    if (operator) queryParams.append('operator', operator);
    
    const response = await fetch(`${API_BASE_URL}/plans/similar?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching similar plans: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Fetch recommended plans
 * @returns {Promise} - Resolves to recommended plans data
 */
async function fetchRecommendedPlans() {
  try {
    const response = await fetch(`${API_BASE_URL}/plans/recommended`);
    
    if (!response.ok) {
      // For errors, fall back to local recommendations
      if (response.status === 500 || response.status === 404) {
        console.warn('Server error occurred, falling back to local recommendations');
        return getLocalRecommendedPlans();
      }
      
      throw new Error(`Error fetching recommended plans: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return getLocalRecommendedPlans();
  }
}

/**
 * Get local recommended plans when API fails
 * @returns {Array} - Array of recommended plans
 */
function getLocalRecommendedPlans() {
  // Create sample recommended plans data
  const recommendedPlans = [
    {
      name: 'Jio Standard Plan',
      operator: 'jio',
      price: 299,
      validity: 28,
      data: '2GB/day',
      data_value: 60,
      voice_calls: 'Unlimited',
      sms: '100/day',
      has_5g: true,
      subscriptions: ['JioTV', 'JioCinema', 'JioCloud'],
      network_coverage: 96,
      data_speed: 60,
      extra_benefits: ['Unlimited 5G Data'],
      plan_type: 'prepaid',
      data_category: 'medium',
      price_category: 'mid',
      validity_category: 'monthly',
      image: '../images/jio.jpeg',
      recommendation: 'Best Value'
    },
    {
      name: 'Airtel Standard Plan',
      operator: 'airtel',
      price: 349,
      validity: 28,
      data: '2.5GB/day',
      data_value: 75,
      voice_calls: 'Unlimited',
      sms: '100/day',
      has_5g: true,
      subscriptions: ['Amazon Prime Subscription', 'Wynk Music', 'Airtel Xstream Premium'],
      network_coverage: 97,
      data_speed: 70,
      extra_benefits: ['Free Hellotunes'],
      plan_type: 'prepaid',
      data_category: 'high',
      price_category: 'mid',
      validity_category: 'monthly',
      image: '../images/airtel.png',
      recommendation: 'Best Data'
    },
    {
      name: 'Jio Basic Plan',
      operator: 'jio',
      price: 179,
      validity: 28,
      data: '1GB/day',
      data_value: 30,
      voice_calls: 'Unlimited',
      sms: '100/day',
      has_5g: true,
      subscriptions: ['JioTV', 'JioCinema'],
      network_coverage: 93,
      data_speed: 35,
      extra_benefits: [],
      plan_type: 'prepaid',
      data_category: 'low',
      price_category: 'budget',
      validity_category: 'monthly',
      image: '../images/jio.jpeg',
      recommendation: 'Budget Choice'
    }
  ];
  
  console.log(`Generated ${recommendedPlans.length} local recommended plans`);
  return recommendedPlans;
}

/**
 * Fetch network coverage data
 * @param {Object} params - Query parameters
 * @returns {Promise} - Resolves to network coverage data
 */
async function fetchNetworkCoverage(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/network-coverage${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching network coverage: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Compare networks for a specific location
 * @param {string} location - The location to compare networks for
 * @returns {Promise} - Resolves to network comparison data
 */
async function compareNetworks(location) {
  try {
    const response = await fetch(`${API_BASE_URL}/compare-networks?location=${encodeURIComponent(location)}`);
    
    if (!response.ok) {
      throw new Error(`Error comparing networks: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get the best network for a location
 * @param {Object} params - Query parameters
 * @returns {Promise} - Resolves to best network data
 */
async function getBestNetwork(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/best-network${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching best network: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get all locations with network coverage
 * @returns {Promise} - Resolves to locations data
 */
async function getLocationsWithCoverage() {
  try {
    const response = await fetch(`${API_BASE_URL}/locations-with-coverage`);
    
    if (!response.ok) {
      throw new Error(`Error fetching locations: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Only show error message on API-dependent pages
function showConnectionError() {
  // Only show error UI for pages that require API
  const isAPIRequiredPage = document.querySelector('[data-requires-api="true"]') !== null;
  
  if (isAPIRequiredPage && !API_PORT_DETECTED) {
    if (document.querySelector('.api-connection-error') === null) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'api-connection-error';
      errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #f44336; color: white; padding: 15px; border-radius: 5px; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.2);';
      errorDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">API Connection Error</div>
        <div>Could not connect to the backend server. Please make sure the server is running on port ${DEFAULT_PORT}.</div>
        <div style="margin-top: 10px; font-size: 0.9em;">
          <p>Try these steps:</p>
          <ol style="margin-left: 20px; margin-top: 5px;">
            <li>Run start_server.bat to start the server</li>
            <li>Check if MongoDB is installed and running</li>
            <li>Make sure port ${DEFAULT_PORT} is not in use by another application</li>
          </ol>
        </div>
        <button id="retry-connection" style="margin-top: 10px; padding: 5px 10px; background: white; color: black; border: none; border-radius: 3px; cursor: pointer;">Retry Connection</button>
        <button id="dismiss-error" style="margin-top: 10px; margin-left: 10px; padding: 5px 10px; background: rgba(255,255,255,0.3); color: white; border: 1px solid white; border-radius: 3px; cursor: pointer;">Dismiss</button>
      `;
      document.body.appendChild(errorDiv);
      
      // Add event listeners
      document.getElementById('retry-connection').addEventListener('click', async () => {
        errorDiv.innerHTML = '<div style="text-align: center;">Retrying connection...</div>';
        await detectApiPort();
        if (API_PORT_DETECTED) {
          errorDiv.remove();
        } else {
          showConnectionError(); // Recreate the error message
        }
      });
      
      document.getElementById('dismiss-error').addEventListener('click', () => {
        errorDiv.remove();
      });
    }
  }
}

// Numlookup API integration
async function lookupMobileNumber(mobileNumber) {
    try {
        // Add +91 prefix if not already present
        const formattedNumber = mobileNumber.startsWith('+91') ? mobileNumber : `+91${mobileNumber}`;
        console.log('Calling Numlookup API for number:', formattedNumber);
        const response = await fetch(`https://api.numlookupapi.com/v1/validate/${formattedNumber}?apikey=${API_CONFIG.NUMLOOKUP_API_KEY}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Numlookup API response:', JSON.stringify(data, null, 2));

        // Extract relevant information from the response
        // Assuming the API returns carrier name and location information
        if (data && data.carrier) {
            const operator = data.carrier.name || 'Unknown';
            const circle = data.location || data.region || 'Unknown';
            const confidence = data.valid === true ? 'high' : 'medium';

            console.log('Extracted data:', { operator, circle, confidence });

            return {
                operator: operator,
                circle: circle,
                confidence: confidence,
                valid: data.valid === true,
                rawResponse: data
            };
        }

        return null;
    } catch (error) {
        console.error('Error in lookupMobileNumber:', error);
        return null;
    }
}

// Google Maps API Key from configuration
const GOOGLE_MAPS_API_KEY = CONFIG.GOOGLE_MAPS_API_KEY;

// Function to get coordinates from location search
async function getCoordinates(searchQuery) {
    if (!searchQuery || searchQuery.trim() === '') {
        console.error('Empty search query provided');
        throw new Error('Please enter a valid location');
    }
    
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formattedAddress: data.results[0].formatted_address
            };
        }
        
        if (data.status === 'ZERO_RESULTS') {
            throw new Error('Location not found. Please try a different search term.');
        } else if (data.status === 'REQUEST_DENIED') {
            console.error('Google Maps API request denied:', data.error_message);
            throw new Error('Location service unavailable. Please try again later.');
        } else {
            console.error('Geocoding error:', data.status, data.error_message);
            throw new Error('Error finding location. Please try again later.');
        }
    } catch (error) {
        console.error('Error getting coordinates:', error);
        throw error;
    }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// Function to get nearby porting centers
async function getNearbyPortingCenters(searchQuery, provider = 'any', radius = 10) {
    try {
        // Get coordinates for the searched location
        const coordinates = await getCoordinates(searchQuery);
        
        // Search for telecom stores in the area using Google Places API
        const placesResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radius * 1000}&keyword=telecom%20store&key=${GOOGLE_MAPS_API_KEY}`
        );
        const placesData = await placesResponse.json();
        
        if (placesData.status !== 'OK') {
            console.warn('Places API error:', placesData.status);
            
            // Fallback with static data if no results found
            if (placesData.status === 'ZERO_RESULTS') {
                return getFallbackPortingCenters(provider);
            }
            
            throw new Error(`Error finding nearby centers: ${placesData.status}`);
        }

        // If no places found, use fallback data
        if (placesData.results.length === 0) {
            return getFallbackPortingCenters(provider);
        }

        // Process and filter the results
        const centers = await Promise.all(placesData.results.slice(0, 10).map(async (place) => {
            try {
                // Get place details for additional information
                const detailsResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,opening_hours,website&key=${GOOGLE_MAPS_API_KEY}`
                );
                const detailsData = await detailsResponse.json();
                const details = detailsData.result || {};

                // Determine the provider based on the place name
                let storeProvider = 'unknown';
                const name = place.name.toLowerCase();
                if (name.includes('airtel')) storeProvider = 'airtel';
                else if (name.includes('jio')) storeProvider = 'jio';
                else if (name.includes('vi') || name.includes('vodafone') || name.includes('idea')) storeProvider = 'vi';
                
                // Skip if we're filtering for a specific provider and this doesn't match
                if (provider !== 'any' && storeProvider !== provider && storeProvider !== 'unknown') {
                    return null;
                }
                
                // Calculate distance from search location
                const distance = calculateDistance(
                    coordinates.lat,
                    coordinates.lng,
                    place.geometry.location.lat,
                    place.geometry.location.lng
                );

                return {
                    name: place.name,
                    provider: storeProvider,
                    address: details.formatted_address || place.vicinity || 'Address not available',
                    phone: details.formatted_phone_number || 'Phone not available',
                    distance: distance.toFixed(1),
                    openNow: place.opening_hours?.open_now,
                    rating: place.rating || 0,
                    totalRatings: place.user_ratings_total || 0,
                    location: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                    },
                    placeId: place.place_id,
                    website: details.website || '',
                    openingHours: details.opening_hours?.weekday_text || []
                };
            } catch (error) {
                console.error('Error processing place details:', error);
                return null;
            }
        }));

        // Filter out null results and sort by distance
        const validCenters = centers.filter(center => center !== null);
        
        if (validCenters.length === 0) {
            console.warn('No valid centers found after filtering, using fallback data');
            return getFallbackPortingCenters(provider);
        }
        
        return validCenters.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    } catch (error) {
        console.error('Error fetching nearby centers:', error);
        return getFallbackPortingCenters(provider);
    }
}

// Fallback function to return static data when API fails
function getFallbackPortingCenters(provider = 'any') {
    const fallbackCenters = [
        {
            name: "Airtel Store",
            provider: "airtel",
            address: "123 Main Street, New Delhi, 110001",
            phone: "+91 98765 43210",
            distance: "2.5",
            openNow: true,
            rating: 4.3,
            totalRatings: 124,
            location: { lat: 28.6139, lng: 77.2090 },
            placeId: "fallback_airtel_1",
            website: "https://www.airtel.in",
            openingHours: [
                "Monday: 9:00 AM – 8:00 PM",
                "Tuesday: 9:00 AM – 8:00 PM",
                "Wednesday: 9:00 AM – 8:00 PM",
                "Thursday: 9:00 AM – 8:00 PM",
                "Friday: 9:00 AM – 8:00 PM",
                "Saturday: 9:00 AM – 8:00 PM",
                "Sunday: 10:00 AM – 6:00 PM"
            ]
        },
        {
            name: "Jio Store",
            provider: "jio",
            address: "456 Market Road, New Delhi, 110002",
            phone: "+91 98765 12345",
            distance: "3.8",
            openNow: true,
            rating: 4.5,
            totalRatings: 156,
            location: { lat: 28.6219, lng: 77.2100 },
            placeId: "fallback_jio_1",
            website: "https://www.jio.com",
            openingHours: [
                "Monday: 9:00 AM – 8:00 PM",
                "Tuesday: 9:00 AM – 8:00 PM",
                "Wednesday: 9:00 AM – 8:00 PM",
                "Thursday: 9:00 AM – 8:00 PM",
                "Friday: 9:00 AM – 8:00 PM",
                "Saturday: 9:00 AM – 8:00 PM",
                "Sunday: 10:00 AM – 6:00 PM"
            ]
        },
        {
            name: "Vi Store",
            provider: "vi",
            address: "789 Tower Lane, New Delhi, 110003",
            phone: "+91 98765 98765",
            distance: "4.2",
            openNow: true,
            rating: 4.1,
            totalRatings: 98,
            location: { lat: 28.6129, lng: 77.2270 },
            placeId: "fallback_vi_1",
            website: "https://www.myvi.in",
            openingHours: [
                "Monday: 9:30 AM – 7:30 PM",
                "Tuesday: 9:30 AM – 7:30 PM",
                "Wednesday: 9:30 AM – 7:30 PM",
                "Thursday: 9:30 AM – 7:30 PM",
                "Friday: 9:30 AM – 7:30 PM",
                "Saturday: 9:30 AM – 7:30 PM",
                "Sunday: 11:00 AM – 5:00 PM"
            ]
        }
    ];

    // Filter by provider if specified
    if (provider !== 'any') {
        return fallbackCenters.filter(center => center.provider === provider);
    }
    
    return fallbackCenters;
}

/**
 * Check network coverage for a specific location and provider
 * @param {string} location - Location to check coverage for
 * @param {string} provider - Provider name (jio, airtel, vi, bsnl)
 * @returns {Promise} - Resolves to coverage data
 */
async function checkCoverage(location, provider = 'all') {
    try {
        const queryParams = new URLSearchParams();
        if (location) queryParams.append('location', location);
        if (provider && provider !== 'all') queryParams.append('provider', provider);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/network-coverage/check${queryString}`);
        
        if (!response.ok) {
            // Fallback to local coverage data
            console.warn(`Server error (${response.status}), falling back to local coverage data`);
            return getLocalCoverageData(location, provider);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking coverage:', error);
        return getLocalCoverageData(location, provider);
    }
}

/**
 * Get local coverage data when API fails
 * @param {string} location - Location to check coverage for
 * @param {string} provider - Provider name
 * @returns {Object} - Coverage data
 */
function getLocalCoverageData(location, provider = 'all') {
    // Default coverage scores (out of 100)
    const coverageScores = {
        'jio': {
            'voice': 90,
            'data': 95,
            '5g': 80,
            'indoor': 85,
            'overall': 90
        },
        'airtel': {
            'voice': 95,
            'data': 90,
            '5g': 85,
            'indoor': 90,
            'overall': 92
        },
        'vi': {
            'voice': 85,
            'data': 80,
            '5g': 70,
            'indoor': 75,
            'overall': 78
        },
        'bsnl': {
            'voice': 80,
            'data': 70,
            '5g': 0,
            'indoor': 65,
            'overall': 68
        }
    };
    
    if (provider !== 'all' && coverageScores[provider]) {
        return {
            location: location || 'Unknown location',
            provider: provider,
            coverage: coverageScores[provider],
            source: 'local_data'
        };
    }
    
    // Return all providers
    return {
        location: location || 'Unknown location',
        providers: Object.keys(coverageScores).map(key => ({
            name: key,
            coverage: coverageScores[key]
        })),
        source: 'local_data'
    };
}

/**
 * Find network towers near a location
 * @param {Object} params - Search parameters
 * @param {number} params.lat - Latitude
 * @param {number} params.lng - Longitude
 * @param {number} params.radius - Radius in kilometers
 * @param {string} params.provider - Provider name (optional)
 * @returns {Promise} - Resolves to tower data
 */
async function findTowers(params = {}) {
    try {
        const { lat, lng, radius = 5, provider } = params;
        
        if (!lat || !lng) {
            throw new Error('Latitude and longitude are required');
        }
        
        const queryParams = new URLSearchParams();
        queryParams.append('lat', lat);
        queryParams.append('lng', lng);
        queryParams.append('radius', radius);
        if (provider) queryParams.append('provider', provider);
        
        const response = await fetch(`${API_BASE_URL}/network-towers?${queryParams.toString()}`);
        
        if (!response.ok) {
            // Fallback to generated tower data
            console.warn(`Server error (${response.status}), falling back to generated tower data`);
            return generateTowerData(lat, lng, radius, provider);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error finding towers:', error);
        return generateTowerData(params.lat, params.lng, params.radius, params.provider);
    }
}

/**
 * Generate sample tower data when API fails
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Radius in kilometers
 * @param {string} providerFilter - Provider to filter by (optional)
 * @returns {Object} - Tower data
 */
function generateTowerData(lat, lng, radius = 5, providerFilter) {
    if (!lat || !lng) {
        return { towers: [] };
    }
    
    // Generate random points within the radius
    const towers = [];
    const providers = ['jio', 'airtel', 'vi', 'bsnl'];
    const types = ['4G', '5G', '3G'];
    
    // Generate between 5-15 towers
    const towerCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < towerCount; i++) {
        // Random distance within radius (with preference for closer)
        const distance = Math.random() * Math.random() * radius;
        
        // Random angle
        const angle = Math.random() * 2 * Math.PI;
        
        // Convert to lat/lng
        // Earth radius is ~6371 km
        const latChange = (distance / 6371) * (180 / Math.PI);
        const lngChange = (distance / 6371) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
        
        const provider = providers[Math.floor(Math.random() * providers.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Skip if filtering by provider
        if (providerFilter && provider !== providerFilter) {
            continue;
        }
        
        towers.push({
            id: `tower_${i}`,
            provider: provider,
            type: type,
            location: {
                lat: lat + latChange * Math.sin(angle),
                lng: lng + lngChange * Math.cos(angle)
            },
            distance: distance.toFixed(1),
            strength: Math.floor(Math.random() * 30) + 70, // 70-100
            active: Math.random() > 0.1 // 90% are active
        });
    }
    
    return {
        center: { lat, lng },
        radius,
        towers: towers,
        source: 'generated_data'
    };
}

/**
 * Fetch reviews for a network provider
 * @param {string} provider - Provider name (jio, airtel, vi, bsnl)
 * @param {Object} params - Query parameters
 * @returns {Promise} - Resolves to reviews data
 */
async function fetchReviewsForNetwork(provider, params = {}) {
    try {
        if (!provider) {
            throw new Error('Provider is required');
        }
        
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/reviews/${provider}${queryString}`);
        
        if (!response.ok) {
            console.warn(`Server error (${response.status}), falling back to sample reviews`);
            return getSampleReviews(provider);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return getSampleReviews(provider);
    }
}

/**
 * Submit a review for a network provider
 * @param {Object} reviewData - Review data
 * @returns {Promise} - Resolves to submission result
 */
async function submitReview(reviewData) {
    try {
        if (!isAuthenticated()) {
            throw new Error('You must be logged in to submit a review');
        }
        
        if (!reviewData.provider || !reviewData.rating) {
            throw new Error('Provider and rating are required');
        }
        
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(reviewData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit review');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
}

/**
 * Fetch user activity (reviews, comments, etc.)
 * @returns {Promise} - Resolves to user activity data
 */
async function fetchUserActivity() {
    try {
        if (!isAuthenticated()) {
            throw new Error('You must be logged in to view your activity');
        }
        
        const response = await fetch(`${API_BASE_URL}/user/activity`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user activity');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching user activity:', error);
        return { reviews: [], comments: [], comparisons: [] };
    }
}

/**
 * Get popular mobile plans across providers
 * @param {Object} params - Query parameters
 * @returns {Promise} - Resolves to popular plans data
 */
async function getPopularPlans(params = {}) {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/plans/popular${queryString}`);
        
        if (!response.ok) {
            console.warn(`Server error (${response.status}), falling back to local popular plans`);
            return getLocalPopularPlans();
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching popular plans:', error);
        return getLocalPopularPlans();
    }
}

/**
 * Get sample reviews when API fails
 * @param {string} provider - Provider name
 * @returns {Array} - Array of sample reviews
 */
function getSampleReviews(provider) {
    const reviews = [
        {
            id: 'sample_review_1',
            provider: 'jio',
            rating: 4,
            title: 'Great speed and coverage',
            review: 'I\'ve been using Jio for over a year now, and I\'m impressed with the speed and coverage.',
            user: {
                name: 'Rahul S.',
                location: 'Mumbai'
            },
            date: '2023-03-15T12:30:00Z',
            likes: 12,
            helpful: 8
        },
        {
            id: 'sample_review_2',
            provider: 'airtel',
            rating: 5,
            title: 'Best network in my area',
            review: 'Airtel has the best coverage in my area. Never had any call drops or data issues.',
            user: {
                name: 'Priya K.',
                location: 'Delhi'
            },
            date: '2023-04-10T09:45:00Z',
            likes: 18,
            helpful: 15
        },
        {
            id: 'sample_review_3',
            provider: 'vi',
            rating: 3,
            title: 'Good value, but inconsistent coverage',
            review: 'Vi offers good value plans, but the coverage can be inconsistent in some areas.',
            user: {
                name: 'Aditya M.',
                location: 'Bangalore'
            },
            date: '2023-02-28T16:20:00Z',
            likes: 5,
            helpful: 3
        },
        {
            id: 'sample_review_4',
            provider: 'bsnl',
            rating: 3,
            title: 'Good in rural areas',
            review: 'BSNL works surprisingly well in rural areas where other networks struggle.',
            user: {
                name: 'Sanjay P.',
                location: 'Kerala'
            },
            date: '2023-01-20T10:15:00Z',
            likes: 9,
            helpful: 7
        }
    ];
    
    // If provider specified, filter reviews
    if (provider) {
        return {
            provider,
            reviews: reviews.filter(review => review.provider === provider),
            total: reviews.filter(review => review.provider === provider).length,
            average_rating: 4.0
        };
    }
    
    return {
        reviews,
        total: reviews.length,
        average_rating: 3.8
    };
}

/**
 * Get local popular plans when API fails
 * @returns {Array} - Array of popular plans
 */
function getLocalPopularPlans() {
    return [
        {
            name: 'Jio Premium Plan',
            operator: 'jio',
            price: 549,
            validity: 84,
            data: '2GB/day',
            has_5g: true,
            popularity_score: 95,
            plan_type: 'prepaid',
            image: '../images/jio.jpeg'
        },
        {
            name: 'Airtel Standard Plan',
            operator: 'airtel',
            price: 349,
            validity: 28,
            data: '2.5GB/day',
            has_5g: true,
            popularity_score: 92,
            plan_type: 'prepaid',
            image: '../images/airtel.png'
        },
        {
            name: 'Vi Standard Plan',
            operator: 'vi',
            price: 319,
            validity: 28,
            data: '2GB/day',
            has_5g: false,
            popularity_score: 88,
            plan_type: 'prepaid',
            image: '../images/vi.png'
        },
        {
            name: 'BSNL Value Plan',
            operator: 'bsnl',
            price: 279,
            validity: 84,
            data: '2GB/day',
            has_5g: false,
            popularity_score: 75,
            plan_type: 'prepaid',
            image: '../images/bsnl.png'
        }
    ];
}

/**
 * Detect operator and circle for a mobile number
 * @param {string} mobileNumber - 10-digit mobile number
 * @returns {Promise} - Resolves to operator and circle data
 */
async function detectOperatorAndCircle(mobileNumber) {
    if (!verifyMobileNumber(mobileNumber)) {
        throw new Error('Invalid mobile number format');
    }
    
    try {
        // First try Numlookup API for accurate results
        const numlookupResult = await lookupMobileNumber(mobileNumber);
        console.log('Numlookup API result:', numlookupResult);
        
        if (numlookupResult && numlookupResult.operator && numlookupResult.operator !== 'Unknown') {
            return {
                operator: numlookupResult.operator.toLowerCase(),
                circle: numlookupResult.circle,
                confidence: numlookupResult.confidence || 'medium',
                source: 'api'
            };
        }
        
        // Fallback to local database if API fails or returns unknown
        console.log("Falling back to local database for", mobileNumber);
        const localResult = findNetworkByNumber(mobileNumber);
        
        return {
            operator: localResult.operator,
            circle: localResult.circle,
            confidence: 'low',
            source: 'local'
        };
    } catch (error) {
        console.error('Error in operator detection:', error);
        
        // Last resort: try local lookup on error
        try {
            const localResult = findNetworkByNumber(mobileNumber);
            return {
                operator: localResult.operator,
                circle: localResult.circle,
                confidence: 'low',
                source: 'local_fallback'
            };
        } catch (e) {
            return {
                operator: 'unknown',
                circle: 'unknown',
                confidence: 'none',
                source: 'error',
                error: error.message
            };
        }
    }
}

/**
 * Verify if a mobile number is in valid format
 * @param {string} mobileNumber - Mobile number to verify
 * @returns {boolean} - True if valid, false otherwise
 */
function verifyMobileNumber(mobileNumber) {
    if (!mobileNumber) return false;
    
    // Remove all non-digit characters
    const cleanedNumber = mobileNumber.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits or starts with country code
    if (cleanedNumber.length === 10) {
        // Check if it starts with a valid first digit (6-9)
        return /^[6-9]\d{9}$/.test(cleanedNumber);
    } else if (cleanedNumber.length === 12 && cleanedNumber.startsWith('91')) {
        // Has country code, check the 10 digits after that
        return /^91[6-9]\d{9}$/.test(cleanedNumber);
    } else if (cleanedNumber.length === 13 && cleanedNumber.startsWith('091')) {
        // Has country code with leading zero
        return /^091[6-9]\d{9}$/.test(cleanedNumber);
    } else if (cleanedNumber.length === 11 && cleanedNumber.startsWith('0')) {
        // Has leading zero
        return /^0[6-9]\d{9}$/.test(cleanedNumber);
    }
    
    return false;
}

/**
 * Find network details by number using local database
 * @param {string} mobileNumber - Mobile number
 * @returns {Object} - Operator and circle details
 */
function findNetworkByNumber(mobileNumber) {
    if (!verifyMobileNumber(mobileNumber)) {
        throw new Error('Invalid mobile number format');
    }
    
    // Clean the number to get just the 10 digits
    const cleanedNumber = mobileNumber.replace(/\D/g, '').slice(-10);
    
    // Extract the first few digits for lookup
    const prefix4 = cleanedNumber.substring(0, 4);
    const prefix3 = cleanedNumber.substring(0, 3);
    const prefix2 = cleanedNumber.substring(0, 2);
    const firstDigit = cleanedNumber.substring(0, 1);
    
    // Sample local database of number prefixes (would be more comprehensive in real implementation)
    const prefixDatabase = {
        '9000': { operator: 'airtel', circle: 'andhra-pradesh' },
        '9001': { operator: 'airtel', circle: 'andhra-pradesh' },
        '9002': { operator: 'airtel', circle: 'kolkata' },
        '9003': { operator: 'airtel', circle: 'tamil-nadu' },
        '9004': { operator: 'airtel', circle: 'mumbai' },
        '9005': { operator: 'airtel', circle: 'delhi' },
        '9006': { operator: 'airtel', circle: 'bihar' },
        '9007': { operator: 'airtel', circle: 'west-bengal' },
        '9008': { operator: 'airtel', circle: 'karnataka' },
        '9009': { operator: 'airtel', circle: 'up-east' },
        
        '7000': { operator: 'jio', circle: 'delhi' },
        '7001': { operator: 'jio', circle: 'mumbai' },
        '7002': { operator: 'jio', circle: 'kolkata' },
        '7003': { operator: 'jio', circle: 'karnataka' },
        '7004': { operator: 'jio', circle: 'tamil-nadu' },
        '7005': { operator: 'jio', circle: 'andhra-pradesh' },
        '7006': { operator: 'jio', circle: 'maharashtra' },
        '7007': { operator: 'jio', circle: 'up-east' },
        '7008': { operator: 'jio', circle: 'gujarat' },
        '7009': { operator: 'jio', circle: 'punjab' },
        
        '8000': { operator: 'vi', circle: 'delhi' },
        '8001': { operator: 'vi', circle: 'mumbai' },
        '8002': { operator: 'vi', circle: 'kolkata' },
        '8003': { operator: 'vi', circle: 'karnataka' },
        '8004': { operator: 'vi', circle: 'tamil-nadu' },
        '8005': { operator: 'vi', circle: 'andhra-pradesh' },
        '8006': { operator: 'vi', circle: 'maharashtra' },
        '8007': { operator: 'vi', circle: 'up-east' },
        '8008': { operator: 'vi', circle: 'gujarat' },
        '8009': { operator: 'vi', circle: 'punjab' },
        
        '6000': { operator: 'bsnl', circle: 'delhi' },
        '6001': { operator: 'bsnl', circle: 'mumbai' },
        '6002': { operator: 'bsnl', circle: 'kolkata' },
        '6003': { operator: 'bsnl', circle: 'karnataka' },
        '6004': { operator: 'bsnl', circle: 'tamil-nadu' },
        '6005': { operator: 'bsnl', circle: 'andhra-pradesh' },
        '6006': { operator: 'bsnl', circle: 'maharashtra' },
        '6007': { operator: 'bsnl', circle: 'up-east' },
        '6008': { operator: 'bsnl', circle: 'gujarat' },
        '6009': { operator: 'bsnl', circle: 'punjab' }
    };
    
    // First digit to operator mapping (as a fallback)
    const firstDigitMap = {
        '9': 'airtel',
        '8': 'vi',
        '7': 'jio',
        '6': 'bsnl'
    };
    
    // Try to match with prefix, starting with the most specific
    if (prefixDatabase[prefix4]) {
        return prefixDatabase[prefix4];
    }
    
    if (prefixDatabase[prefix3]) {
        return prefixDatabase[prefix3];
    }
    
    if (prefixDatabase[prefix2]) {
        return prefixDatabase[prefix2];
    }
    
    // Fallback to first digit only for operator
    if (firstDigitMap[firstDigit]) {
        return {
            operator: firstDigitMap[firstDigit],
            circle: 'unknown'
        };
    }
    
    // Default fallback if nothing matches
    return {
        operator: 'unknown',
        circle: 'unknown'
    };
}

/**
 * Get portability status for a mobile number
 * @param {string} mobileNumber - Mobile number
 * @returns {Promise} - Portability status
 */
async function getPortabilityStatus(mobileNumber) {
    if (!verifyMobileNumber(mobileNumber)) {
        throw new Error('Invalid mobile number format');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/portability/status?number=${mobileNumber}`);
        
        if (!response.ok) {
            // Fallback to simulated status
            return getSimulatedPortabilityStatus(mobileNumber);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking portability status:', error);
        return getSimulatedPortabilityStatus(mobileNumber);
    }
}

/**
 * Get simulated portability status (when API fails)
 * @param {string} mobileNumber - Mobile number
 * @returns {Object} - Simulated status
 */
function getSimulatedPortabilityStatus(mobileNumber) {
    // Use the last digit to determine if number is portable
    const lastDigit = mobileNumber.slice(-1);
    const isPortable = parseInt(lastDigit) % 3 !== 0; // 2/3 of numbers will be portable
    
    if (isPortable) {
        return {
            number: mobileNumber,
            portable: true,
            reason: null,
            eligibility: {
                days_since_last_port: Math.floor(Math.random() * 180) + 90,
                active_status: true,
                bill_cleared: true
            },
            source: 'simulated'
        };
    } else {
        const reasons = [
            'Number ported within last 90 days',
            'Outstanding bills not cleared',
            'Ongoing contractual obligations',
            'Account not active for minimum required period'
        ];
        
        return {
            number: mobileNumber,
            portable: false,
            reason: reasons[parseInt(lastDigit) % reasons.length],
            eligibility: {
                days_since_last_port: Math.floor(Math.random() * 90),
                active_status: Math.random() > 0.5,
                bill_cleared: Math.random() > 0.5
            },
            source: 'simulated'
        };
    }
}

// Instead of using ES module exports, all functions are already attached to the 
// global window.PortMySimAPI object for use by other scripts
/* 
export { 
    authAPI, 
    lookupMobileNumber,
    getNearbyPortingCenters,
    getFallbackPortingCenters,
    fetchPlans,
    fetchPlansByOperator,
    compareNetworks,
    getPopularPlans,
    detectOperatorAndCircle,
    verifyMobileNumber,
    getPortabilityStatus,
    comparePlans,
    fetchRecommendedPlans
};
*/
