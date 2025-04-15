/**
 * Authentication Fix Script
 * Fixes issues with authentication tokens for PortMySim
 */

console.log('Authentication fix script loaded');

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
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      // Clean token before storing
      const cleanToken = data.token.trim();
      localStorage.setItem('portmysim_token', cleanToken);
      localStorage.setItem('portmysim_user', JSON.stringify(data.user));
      console.log('Login successful, token stored');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Run the fix immediately
const fixedToken = fixAuthToken();
console.log('Token fix result:', fixedToken ? 'Token fixed' : 'No valid token');

// Add the functions to window for access from console for debugging
window.authFix = {
  fixToken: fixAuthToken,
  testAuth: testAuthentication,
  login: login
};

// Function to submit porting request with fixed authentication
window.submitPortingWithFixedAuth = async function(formData) {
  console.log('Using fixed auth submission function');
  
  // Use the fixAuthToken function to get a clean, validated token
  const token = fixAuthToken();
  
  if (!token) {
    console.error('No valid token found for submission');
    alert('You need to be logged in. Redirecting to login page.');
    window.location.href = '/HTML/login.html?redirect=schedule-porting.html';
    return { success: false, error: 'Authentication required' };
  }
  
  console.log('Using cleaned token for submission');
  
  try {
    // Add user data to request if available
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
    
    console.log('Submitting porting request with data:', formData);
    
    const response = await fetch('http://localhost:5000/api/porting/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    console.log('Submission response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Submission successful:', data);
    return data;
  } catch (error) {
    console.error('Error submitting porting request:', error);
    return { success: false, error: error.message };
  }
};

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