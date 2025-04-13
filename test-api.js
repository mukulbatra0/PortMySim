/**
 * API Test Script
 * 
 * This script tests the login API endpoint
 */

const TEST_URL = 'http://localhost:5000/api/auth/login';

// Test credentials
const credentials = {
  email: 'demo@example.com',
  password: 'Password123'
};

// Function to test the login API
async function testLogin() {
  console.log('Testing login API...');
  console.log(`URL: ${TEST_URL}`);
  console.log(`Credentials: ${JSON.stringify(credentials)}`);
  
  try {
    const response = await fetch(TEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed!');
    }
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

// Run the test
testLogin(); 