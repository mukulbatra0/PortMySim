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

/**
 * API utilities for fetching data from the backend
 */

/**
 * Fetch all plans with optional filtering
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise} - Resolves to plans data
 */
export async function fetchPlans(filters = {}) {
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
export async function fetchPlansByOperator(operator) {
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
    return data;
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
 * Compare multiple plans
 * @param {Array} planIds - Array of plan IDs to compare
 * @returns {Promise} - Resolves to comparison data
 */
export async function comparePlans(planIds) {
  try {
    console.log('Comparing plans with IDs:', planIds);
    const url = `${API_BASE_URL}/plans/compare`;
    console.log('Request URL:', url);
    console.log('Request payload:', { planIds });
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ planIds }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', response.status, errorText);
      
      // For 500 errors, fall back to local processing instead of throwing an error
      if (response.status === 500) {
        console.warn('Server error occurred, falling back to local data processing');
        return processPlanComparisonLocally(planIds);
      }
      
      throw new Error(`Error comparing plans: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Comparison data received:', data);
    
    // Validate response data format
    if (!data.plans || !Array.isArray(data.plans) || data.plans.length === 0) {
      console.error('Invalid plans data format:', data);
      throw new Error('Response missing plans data');
    }
    
    // Add fallback feature data if missing
    if (!data.features) {
      console.warn('Features missing in API response, adding fallback data');
      data.features = {
        daily_data: Array(data.plans.length).fill(false),
        validity: Array(data.plans.length).fill(false),
        price: Array(data.plans.length).fill(false),
        coverage: Array(data.plans.length).fill(false),
        speed: Array(data.plans.length).fill(false)
      };
      
      // Set some reasonable feature highlights
      if (data.plans.length > 0) {
        // Find best data plan
        const maxDataIndex = data.plans.reduce((maxIdx, plan, idx, arr) => 
          (plan.data_value > arr[maxIdx].data_value) ? idx : maxIdx, 0);
        if (maxDataIndex >= 0) data.features.daily_data[maxDataIndex] = true;
        
        // Find best validity plan
        const maxValidityIndex = data.plans.reduce((maxIdx, plan, idx, arr) => 
          (plan.validity > arr[maxIdx].validity) ? idx : maxIdx, 0);
        if (maxValidityIndex >= 0) data.features.validity[maxValidityIndex] = true;
        
        // Find best price plan
        const minPriceIndex = data.plans.reduce((minIdx, plan, idx, arr) => 
          (plan.price < arr[minIdx].price) ? idx : minIdx, 0);
        if (minPriceIndex >= 0) data.features.price[minPriceIndex] = true;
      }
    }
    
    return data;
  } catch (error) {
    console.error('API Error in comparePlans:', error);
    throw error;
  }
}

/**
 * Local fallback processing for plan comparisons when the server returns an error
 * @param {Array} planIds - Array of plan IDs to compare
 * @returns {Object} - Comparison data object
 */
function processPlanComparisonLocally(planIds) {
  console.log('Processing plan comparison locally with IDs:', planIds);
  
  // Create sample fallback data
  // This is the same sample data used in plans.js
  const samplePlans = [
    {
      operator: 'jio',
      name: 'Jio Premium',
      price: 399,
      data: '3GB/day',
      data_value: 90,
      validity: 84,
      validity_category: 'quarterly',
      has_5g: true,
      voice_calls: 'Unlimited',
      sms: '100/day',
      subscriptions: ['JioTV', 'JioCinema'],
      network_coverage: 98,
      data_speed: 50,
      image: '../images/jio.jpeg',
      recommendation: 'Best Value'
    },
    {
      operator: 'airtel',
      name: 'Airtel Smart',
      price: 349,
      data: '2.5GB/day',
      data_value: 75,
      validity: 56,
      validity_category: 'quarterly',
      has_5g: true,
      voice_calls: 'Unlimited',
      sms: '100/day',
      subscriptions: ['Amazon Prime'],
      network_coverage: 99,
      data_speed: 100,
      image: '../images/airtel.png',
      recommendation: 'Best Data'
    },
    {
      operator: 'vi',
      name: 'Vi Value',
      price: 329,
      data: '2GB/day',
      data_value: 60,
      validity: 70,
      validity_category: 'quarterly',
      has_5g: false,
      voice_calls: 'Unlimited',
      sms: '100/day',
      subscriptions: ['Vi Movies & TV'],
      network_coverage: 92,
      data_speed: 45,
      image: '../images/vi.png',
      recommendation: 'Budget Choice'
    }
  ];
  
  // Filter plans based on IDs
  const plansToCompare = samplePlans.filter(plan => planIds.includes(plan.name));
  
  // Use the first two plans if no matches
  const finalPlans = plansToCompare.length >= 2 ? plansToCompare : samplePlans.slice(0, 2);
  
  // Calculate value scores
  const valueScores = finalPlans.map(plan => {
    return { score: (Math.random() * 3 + 7).toFixed(1) }; // Random score between 7-10
  });
  
  // Create the response object
  const comparisonData = {
    plans: finalPlans,
    valueScores,
    features: {
      daily_data: Array(finalPlans.length).fill(false),
      validity: Array(finalPlans.length).fill(false),
      price: Array(finalPlans.length).fill(false),
      coverage: Array(finalPlans.length).fill(false),
      speed: Array(finalPlans.length).fill(false)
    }
  };
  
  // Mark some features as best
  if (finalPlans.length > 0) {
    // Data
    const maxDataIndex = finalPlans.reduce((maxIdx, plan, idx, arr) => 
      (plan.data_value > arr[maxIdx].data_value) ? idx : maxIdx, 0);
    comparisonData.features.daily_data[maxDataIndex] = true;
    
    // Validity
    const maxValidityIndex = finalPlans.reduce((maxIdx, plan, idx, arr) => 
      (plan.validity > arr[maxIdx].validity) ? idx : maxIdx, 0);
    comparisonData.features.validity[maxValidityIndex] = true;
    
    // Generate summary
    const bestValuePlan = finalPlans[maxDataIndex];
    const cheapestPlan = finalPlans.reduce((min, p) => p.price < min.price ? p : min, finalPlans[0]);
    
    comparisonData.summary = `Based on our analysis, ${bestValuePlan.name} offers the best value for money at ₹${bestValuePlan.price}. If budget is your primary concern, ${cheapestPlan.name} is the most affordable option at ₹${cheapestPlan.price}.`;
  }
  
  console.log('Local comparison data generated:', comparisonData);
  return comparisonData;
}

/**
 * Fetch similar plans for comparison
 * @param {Object} options - Options for finding similar plans
 * @param {string} options.planId - Base plan ID
 * @param {number} options.priceRange - Price range for finding similar plans
 * @param {string} options.operator - Operator to filter plans
 * @returns {Promise} - Resolves to similar plans data
 */
export async function fetchSimilarPlans({ planId, priceRange, operator }) {
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
export async function fetchRecommendedPlans() {
  try {
    console.log('Fetching recommended plans...');
    const url = `${API_BASE_URL}/plans/recommended`;
    console.log(`Request URL: ${url}`);
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Error status: ${response.status}`);
      
      // For 500 errors, fall back to local processing
      if (response.status === 500) {
        console.warn('Server error occurred, falling back to local recommended plans data');
        return getLocalRecommendedPlans();
      }
      
      throw new Error(`Error fetching recommended plans: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data.length} recommended plans`);
    return data;
  } catch (error) {
    console.error('API Error fetching recommended plans:', error);
    // For any kind of fetch error (including timeout), fall back to local data
    console.warn('Using local fallback data for recommended plans');
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
 * Fetch network coverage data for a location
 * @param {Object} params - Query parameters
 * @param {string} params.location - Location name
 * @param {number} params.lat - Latitude
 * @param {number} params.lng - Longitude
 * @param {string} params.operator - Operator name
 * @param {string} params.technology - Technology type (4g or 5g)
 * @returns {Promise} - Resolves to coverage data
 */
export async function fetchNetworkCoverage(params = {}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_BASE_URL}/network-coverage${queryString}`;
    console.log(`Fetching network coverage data: ${url}`);
    
    const response = await fetch(url);
    
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
 * @param {Object} params - Query parameters
 * @param {string} params.location - Location name
 * @param {number} params.lat - Latitude
 * @param {number} params.lng - Longitude
 * @param {string} params.operators - Comma-separated list of operators
 * @returns {Promise} - Resolves to comparison data
 */
export async function compareNetworks(params = {}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_BASE_URL}/network-coverage/compare${queryString}`;
    console.log(`Comparing networks: ${url}`);
    
    const response = await fetch(url);
    
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
 * @param {string} params.location - Location name
 * @param {number} params.lat - Latitude
 * @param {number} params.lng - Longitude
 * @param {string} params.criteria - Ranking criteria (overall, coverage, speed, callQuality, indoorReception)
 * @returns {Promise} - Resolves to best network data
 */
export async function getBestNetwork(params = {}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_BASE_URL}/network-coverage/best-network${queryString}`;
    console.log(`Getting best network: ${url}`);
    
    const response = await fetch(url);
    
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
 * Get available locations for network coverage data
 * @returns {Promise} - Resolves to list of locations
 */
export async function getLocationsWithCoverage() {
  try {
    const url = `${API_BASE_URL}/network-coverage/locations`;
    console.log(`Fetching locations: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching locations: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
} 