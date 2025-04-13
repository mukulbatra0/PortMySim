/**
 * JWT Test Script
 * Tests JWT token creation and verification
 */

import jwt from 'jsonwebtoken';

// Set fallback JWT secret for testing
const JWT_SECRET = process.env.JWT_SECRET || 'portmysim_secure_jwt_secret_key_2023';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

console.log('Using JWT_SECRET:', JWT_SECRET ? 'Secret available' : 'SECRET MISSING');

// Test data
const userData = {
  id: 'user123',
  role: 'user'
};

// Create JWT token
function createToken() {
  try {
    const token = jwt.sign(
      userData,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    
    console.log('✅ TOKEN CREATED SUCCESSFULLY');
    return token;
  } catch (error) {
    console.error('❌ ERROR CREATING TOKEN:', error.message);
    return null;
  }
}

// Verify JWT token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ TOKEN VERIFIED SUCCESSFULLY');
    console.log('Decoded data:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ ERROR VERIFYING TOKEN:', error.message);
    return null;
  }
}

// Run the test
const token = createToken();
if (token) {
  verifyToken(token);
}

console.log('\nTest complete.'); 