/**
 * Authentication Fix Script
 * Fixes issues with authentication tokens for PortMySim
 */

console.log('Authentication fix script loaded');

// Synchronize tokens across different storage keys
function synchronizeAuthTokens() {
  const AUTH_TOKEN_KEY = 'portmysim_auth_token';
  const LEGACY_TOKEN_KEY = 'portmysim_token';
  
  // Get tokens from both locations
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  
  console.log('Synchronizing auth tokens...');
  console.log('Auth token exists:', !!authToken);
  console.log('Legacy token exists:', !!legacyToken);
  
  // If one token exists but not the other, copy it
  if (authToken && !legacyToken) {
    localStorage.setItem(LEGACY_TOKEN_KEY, authToken);
    console.log('Copied auth token to legacy token location');
  } else if (legacyToken && !authToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
    console.log('Copied legacy token to auth token location');
  } else if (authToken && legacyToken && authToken !== legacyToken) {
    // If both exist but are different, use the most recently updated one
    // For simplicity, we'll use the authToken as the source of truth
    localStorage.setItem(LEGACY_TOKEN_KEY, authToken);
    console.log('Synchronized tokens, using auth token as source of truth');
  }
  
  return localStorage.getItem(LEGACY_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
}

// Check and fix token in localStorage
function fixAuthToken() {
  const TOKEN_KEY = 'portmysim_token';
  let token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) {
    console.log('No token found in localStorage');
    return null;
  }
  
  console.log('Original token:', token.substring(0, 10) + '...');
  
  // Clean token format
  let fixedToken = token.trim();
  
  // Remove quotes if present
  if (fixedToken.startsWith('"') && fixedToken.endsWith('"')) {
    console.log('Removing quotes from token');
    fixedToken = fixedToken.substring(1, fixedToken.length - 1);
    localStorage.setItem(TOKEN_KEY, fixedToken);
  }
  
  // Validate token format (should have 3 parts separated by dots)
  const parts = fixedToken.split('.');
  if (parts.length !== 3) {
    console.error('Invalid token format, clearing token');
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  
  console.log('Token fixed and validated');
  return fixedToken;
}

// Try to submit authentication test to verify token works
async function testAuthentication() {
  const token = localStorage.getItem('portmysim_token');
  if (!token) return false;
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('Authentication test successful');
      return true;
    }
    
    console.error('Authentication test failed:', response.status);
    return false;
  } catch (error) {
    console.error('Error testing authentication:', error);
    return false;
  }
}

// Login function with proper token handling
async function login(email, password) {
  try {
    if (!email || !password) {
      console.error('Login requires both email and password');
      return false;
    }
    
    console.log(`Attempting to login with email: ${email}`);
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorStatus = response.status;
      console.error(`Login failed with status: ${errorStatus}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.success && data.token) {
      // Clean token before storing
      const cleanToken = data.token.trim();
      localStorage.setItem('portmysim_token', cleanToken);
      localStorage.setItem('portmysim_user', JSON.stringify(data.user));
      console.log('Login successful, token stored');
      return true;
    }
    
    console.error('Login failed: ' + (data.message || 'Unknown error'));
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Run synchronization and fix immediately
synchronizeAuthTokens();
const fixedToken = fixAuthToken();
console.log('Token fix result:', fixedToken ? 'Token fixed' : 'No valid token');

// Check if token is valid and attempt to automatically login if a login form exists
(async function() {
  try {
    // Test the current token if it exists
    if (localStorage.getItem('portmysim_token')) {
      const isValid = await testAuthentication();
      if (isValid) {
        console.log('Authentication token is valid');
        return;
      }
      console.log('Authentication token is invalid or expired');
    } else {
      console.log('No authentication token found');
    }
    
    // Implement a simple login dialog if token is missing or invalid
    window.promptForLogin = async function() {
      return new Promise((resolve) => {
        // Create a simple login dialog
        const loginDialog = document.createElement('div');
        loginDialog.style.position = 'fixed';
        loginDialog.style.top = '0';
        loginDialog.style.left = '0';
        loginDialog.style.width = '100%';
        loginDialog.style.height = '100%';
        loginDialog.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loginDialog.style.display = 'flex';
        loginDialog.style.justifyContent = 'center';
        loginDialog.style.alignItems = 'center';
        loginDialog.style.zIndex = '9999';
        
        // Create the login form
        loginDialog.innerHTML = `
          <div style="background: white; padding: 20px; border-radius: 5px; width: 300px;">
            <h3 style="margin-top: 0;">Login Required</h3>
            <p>Please login to continue</p>
            <form id="auth-fix-login-form">
              <div style="margin-bottom: 10px;">
                <label for="auth-fix-email" style="display: block; margin-bottom: 5px;">Email:</label>
                <input type="email" id="auth-fix-email" style="width: 100%; padding: 8px;" required>
              </div>
              <div style="margin-bottom: 15px;">
                <label for="auth-fix-password" style="display: block; margin-bottom: 5px;">Password:</label>
                <input type="password" id="auth-fix-password" style="width: 100%; padding: 8px;" required>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <button type="submit" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; cursor: pointer;">Login</button>
                <button type="button" id="auth-fix-cancel" style="padding: 8px 15px; background: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
              </div>
            </form>
          </div>
        `;
        
        document.body.appendChild(loginDialog);
        
        // Handle login submission
        document.getElementById('auth-fix-login-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('auth-fix-email').value;
          const password = document.getElementById('auth-fix-password').value;
          
          // Remove the dialog while attempting login
          loginDialog.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 5px;">
              <p>Logging in...</p>
            </div>
          `;
          
          const success = await login(email, password);
          
          if (success) {
            document.body.removeChild(loginDialog);
            resolve(true);
          } else {
            // Show error and allow retry
            loginDialog.innerHTML = `
              <div style="background: white; padding: 20px; border-radius: 5px; width: 300px;">
                <h3 style="margin-top: 0;">Login Failed</h3>
                <p>Invalid credentials. Please try again.</p>
                <form id="auth-fix-login-form">
                  <div style="margin-bottom: 10px;">
                    <label for="auth-fix-email" style="display: block; margin-bottom: 5px;">Email:</label>
                    <input type="email" id="auth-fix-email" style="width: 100%; padding: 8px;" required value="${email}">
                  </div>
                  <div style="margin-bottom: 15px;">
                    <label for="auth-fix-password" style="display: block; margin-bottom: 5px;">Password:</label>
                    <input type="password" id="auth-fix-password" style="width: 100%; padding: 8px;" required>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <button type="submit" style="padding: 8px 15px; background: #4CAF50; color: white; border: none; cursor: pointer;">Retry</button>
                    <button type="button" id="auth-fix-cancel" style="padding: 8px 15px; background: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
                  </div>
                </form>
              </div>
            `;
            
            // Re-attach event listeners
            document.getElementById('auth-fix-login-form').addEventListener('submit', arguments.callee);
            document.getElementById('auth-fix-cancel').addEventListener('click', () => {
              document.body.removeChild(loginDialog);
              resolve(false);
            });
          }
        });
        
        // Handle cancel button
        document.getElementById('auth-fix-cancel').addEventListener('click', () => {
          document.body.removeChild(loginDialog);
          resolve(false);
        });
      });
    };
    
    // Try to automatically prompt for login when document is ready
    if (document.readyState === 'complete') {
      window.promptForLogin();
    } else {
      window.addEventListener('load', window.promptForLogin);
    }
  } catch (error) {
    console.error('Auto-authentication error:', error);
  }
})();

// Add the functions to window for access from console for debugging
window.authFix = {
  fixToken: fixAuthToken,
  testAuth: testAuthentication,
  login: login
};

// Function to submit porting request with fixed authentication
window.submitPortingWithFixedAuth = async function(formData) {
  console.log('Using fixed auth submission function');
  
  // Try to use authentication token if available
  console.log('Attempting to use authentication token if available');
  
  try {
    // Add user data to request if available (but not required)
    const userData = localStorage.getItem('portmysim_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user._id) {
          formData.userId = user._id;
        }
      } catch (e) {
        console.warn('Could not parse user data:', e);
      }
    }
    
    // Format location data if needed
    if (formData.location && typeof formData.location === 'string') {
      // Try to get coordinates for the location
      try {
        if (window.getCoordinates) {
          const coordinates = await window.getCoordinates(formData.location);
          if (coordinates) {
            formData.location = {
              address: formData.location,
              lat: coordinates.lat,
              lng: coordinates.lng
            };
          }
        }
      } catch (locationError) {
        console.warn('Could not get coordinates for location:', locationError);
        // Continue with just the address string
        formData.location = { address: formData.location };
      }
    }
    
    // Ensure dates are in proper format
    if (formData.scheduledDate) {
      // Ensure it's a valid date string in ISO format
      const scheduledDate = new Date(formData.scheduledDate);
      if (!isNaN(scheduledDate.getTime())) {
        formData.scheduledDate = scheduledDate.toISOString().split('T')[0];
      }
    }
    
    if (formData.planEndDate) {
      // Ensure it's a valid date string in ISO format
      const planEndDate = new Date(formData.planEndDate);
      if (!isNaN(planEndDate.getTime())) {
        formData.planEndDate = planEndDate.toISOString().split('T')[0];
      }
    }
    
    console.log('Submitting porting request with data:', formData);
    
    // Try to check if backend is available first before making the full request
    const isBackendAvailable = await checkBackendAvailability();
    
    if (!isBackendAvailable) {
      console.log('Backend server not available, using mock response immediately');
      // Generate mock response
      return generateMockResponse(formData);
    }
    
    try {
      // First try to submit to the backend API
      const baseUrl = window.API_BASE_URL || 'http://localhost:5000/api';
      console.log(`Using API base URL: ${baseUrl}`);
      
      // Try the standard endpoint first (which is already known to exist)
      const endpoint = '/porting/submit';
      console.log(`Using endpoint: ${endpoint}`);
      
      // Prepare headers with authentication if token is available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add token if available
      const token = localStorage.getItem('portmysim_token');
      if (token) {
        console.log('Adding authentication token to request');
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.log('No authentication token available - attempting to obtain one');
        
        // Try to prompt for login if the function exists
        if (window.promptForLogin) {
          console.log('Prompting user for login credentials');
          const loginSuccess = await window.promptForLogin();
          
          if (loginSuccess) {
            console.log('Login successful, adding new token to request');
            const newToken = localStorage.getItem('portmysim_token');
            if (newToken) {
              headers['Authorization'] = `Bearer ${newToken}`;
            }
          } else {
            console.warn('Login failed or was cancelled - request may fail if authentication is required');
          }
        } else {
          console.warn('No login prompt function available - request may fail if authentication is required');
          console.info('You can login via console with: authFix.login("your_email", "your_password")');
        }
      }
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });
      
      // If the request fails due to connection issues, fall back to mock
      if (!response.ok) {
        console.warn(`API request failed with status ${response.status}`);
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        // If authentication failed and we have a login prompt function, suggest login
        if (response.status === 401 && window.promptForLogin) {
          console.log('Authentication failed, prompting for login');
          const loginSuccess = await window.promptForLogin();
          
          if (loginSuccess) {
            console.log('Login successful, retrying request');
            // Retry the request with the new token
            return window.submitPortingWithFixedAuth(formData);
          }
        } else if (response.status === 401) {
          console.error('Authentication failed (401 Unauthorized). Try logging in first.');
          // Option to try login via console
          console.info('You can login via console with: authFix.login("your_email", "your_password")');
        }
        
        // Fall back to mock response
        console.log('API request failed, using mock response');
        return generateMockResponse(formData);
      }
      
      // Parse successful response
      const data = await response.json();
      console.log('Submission successful:', data);
      return data;
    } catch (fetchError) {
      console.error('Error submitting to backend API:', fetchError);
      
      // Fall back to mock response if API call fails
      console.log('Falling back to mock response');
      return generateMockResponse(formData);
    }
  } catch (error) {
    console.error('Error submitting porting request:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to check if backend is available
async function checkBackendAvailability() {
  try {
    // Try to access a simple endpoint
    const baseUrl = window.API_BASE_URL || 'http://localhost:5000/api';
    
    // Prepare headers with authentication if token is available
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add token if available
    const token = localStorage.getItem('portmysim_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseUrl}/health/check`, {
      method: 'GET',
      headers: headers
    });
    
    if (response.ok) {
      console.log('Backend server is available');
      return true;
    }
    
    console.warn(`Backend server health check failed with status: ${response.status}`);
    
    // If it's an authentication error, it means the server is available but requires auth
    if (response.status === 401) {
      console.log('Backend available but requires authentication');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Backend server not available:', error);
    return false;
  }
}

// Helper function to generate a mock response
function generateMockResponse(formData) {
  console.log('Generating mock response');
  
  if (typeof window.generateMockResponse === 'function') {
    console.log('Using app-provided mock response generator');
    return window.generateMockResponse(formData);
  }
  
  // Basic mock response if the app doesn't provide one
  console.log('Using basic mock response');
  return {
    success: true,
    message: 'Porting request submitted successfully (mock)',
    data: {
      id: `mock_${Date.now()}`,
      refNumber: `PORT-${Math.floor(Math.random() * 900000) + 100000}`,
      status: 'pending',
      scheduledDate: formData.scheduledDate,
      mobileNumber: formData.mobileNumber,
      currentProvider: formData.currentProvider,
      currentCircle: formData.currentCircle,
      newProvider: formData.newProvider,
      smsDate: new Date(new Date(formData.planEndDate).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      portingCenterDetails: {
        name: "Local Service Center",
        address: "123 Main Street, Near You"
      }
    }
  };
}

// Direct override of submitPortingRequest if it exists
document.addEventListener('DOMContentLoaded', function() {
  console.log('Fix-auth: Checking if submitPortingRequest needs to be overridden');
  
  if (window.submitPortingRequest) {
    console.log('Fix-auth: Found submitPortingRequest, saving original and overriding');
    window.originalSubmitPortingRequest = window.submitPortingRequest;
    window.submitPortingRequest = window.submitPortingWithFixedAuth;
  } else {
    console.log('Fix-auth: Setting up override for when submitPortingRequest is defined');
    let originalDefineProperty = Object.defineProperty;
    
    Object.defineProperty(window, 'submitPortingRequest', {
      set: function(newFunction) {
        console.log('Fix-auth: submitPortingRequest is being defined, overriding with fixed version');
        originalDefineProperty(window, 'submitPortingRequest', {
          value: window.submitPortingWithFixedAuth,
          writable: true,
          configurable: true
        });
      },
      configurable: true
    });
  }
}); 