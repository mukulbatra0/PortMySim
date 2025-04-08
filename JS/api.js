/**
 * API Client for PortMySim
 * Handles all API requests to the backend server
 */

import API_CONFIG from './config.js';

// Base API URL - change this to your actual backend URL in production
const DEFAULT_PORT = 5000;
let API_BASE_URL = 'http://localhost:5000/api';
let API_PORT_DETECTED = false;

// Config for port detection
const PORT_DETECTION_CONFIG = {
  // Only try the most likely ports
  portsToTry: [5000], // Focus on the one port we know is used
  timeoutMs: 2000,   // Shorter timeout
  retryCount: 1,     // Only try once per port
  retryDelayMs: 0    // No delay between retries
};

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

    // First check if response is OK
    if (!response.ok) {
      // Get response as text first for debugging
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      
      // Try to parse as JSON if possible
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        return { success: false, message: errorData.message || 'API request failed' };
      } catch (e) {
        // If not valid JSON, throw error with status code
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    // Now try to parse successful response as JSON
    const data = await response.json();

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
 * Compare multiple plans
 * @param {string[]} planIds - Array of plan IDs to compare
 * @returns {Promise<Object>} Comparison results
 */
export const comparePlans = async (planIds) => {
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
};

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

// Export functions for ES modules
export { 
    compareNetworks,
    fetchNetworkCoverage,
    getLocationsWithCoverage,
    fetchPlans,
    fetchPlansByOperator,
    fetchRecommendedPlans,
    lookupMobileNumber,
    getNearbyPortingCenters
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

// Disable port detection entirely - just use port 5000
// Using DEFAULT_PORT defined at the top of the file
async function detectApiPort() {
  // Always use DEFAULT_PORT (5000)
  API_BASE_URL = 'http://localhost:5000/api';
  
  try {
    // Just try the main API endpoint once with a short timeout
    const pingUrl = `${API_BASE_URL}/auth/ping`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        console.log(`Connected to API server on port ${DEFAULT_PORT}`);
        API_PORT_DETECTED = true;
        
        // Hide any existing error message
        const errorDiv = document.querySelector('.api-connection-error');
        if (errorDiv) {
          errorDiv.style.display = 'none';
        }
      }
    }
  } catch (error) {
    // Silent failure, just note it in console
    console.log(`API server not detected. Some features may be limited.`);
  }
  
  return API_BASE_URL;
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

// Google Maps API Key (Replace with your actual API key)
const GOOGLE_MAPS_API_KEY = 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg';

// Function to get coordinates from location search
async function getCoordinates(searchQuery) {
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
        throw new Error('Location not found');
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
            throw new Error('No places found');
        }

        // Process and filter the results
        const centers = await Promise.all(placesData.results.map(async place => {
            // Get place details for additional information
            const detailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,opening_hours,website&key=${GOOGLE_MAPS_API_KEY}`
            );
            const detailsData = await detailsResponse.json();
            const details = detailsData.result;

            // Determine the provider based on the place name
            let storeProvider = 'unknown';
            const name = place.name.toLowerCase();
            if (name.includes('airtel')) storeProvider = 'airtel';
            else if (name.includes('jio')) storeProvider = 'jio';
            else if (name.includes('vi') || name.includes('vodafone') || name.includes('idea')) storeProvider = 'vi';
            
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
                address: details.formatted_address || place.vicinity,
                phone: details.formatted_phone_number,
                distance: distance.toFixed(1),
                openNow: place.opening_hours?.open_now,
                rating: place.rating,
                totalRatings: place.user_ratings_total,
                location: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng
                },
                placeId: place.place_id,
                website: details.website,
                openingHours: details.opening_hours?.weekday_text
            };
        }));

        // Filter by provider if specified
        const filteredCenters = provider === 'any' 
            ? centers 
            : centers.filter(center => center.provider === provider);

        // Sort by distance
        return filteredCenters.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    } catch (error) {
        console.error('Error fetching nearby centers:', error);
        throw error;
    }
}
