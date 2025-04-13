/**
 * Mock User Service
 * Used as a fallback when MongoDB connection fails
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// In-memory user store
const users = [
  {
    _id: 'user123',
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '9876543210',
    password: '$2a$10$3Ia1dxzH4vDM28e5E0mSk.dg.I2oKMPGQ6M2h7zcQgJ0Cql5LoOXe', // hash for 'Password123'
    role: 'user',
    isEmailVerified: true,
    authProvider: 'local',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper function to find user by criteria
const findUser = (criteria) => {
  return users.find(user => {
    for (const [key, value] of Object.entries(criteria)) {
      if (user[key] !== value) return false;
    }
    return true;
  });
};

// Helper to create JWT tokens with same interface as Mongoose model
const getSignedJwtToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Helper to verify passwords with same interface as Mongoose model
const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Mock User Service functions
const mockUserService = {
  findOne: async (criteria) => {
    const user = findUser(criteria);
    if (!user) return null;

    // Add methods to mimic Mongoose model
    user.getSignedJwtToken = () => getSignedJwtToken(user);
    user.matchPassword = (password) => matchPassword(password, user.password);
    
    return user;
  },
  
  findById: async (id) => {
    return mockUserService.findOne({ _id: id });
  },
  
  create: async (userData) => {
    // Generate ID
    const id = `user_${crypto.randomBytes(8).toString('hex')}`;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create new user
    const newUser = {
      _id: id,
      ...userData,
      password: hashedPassword,
      isEmailVerified: true, // Auto-verify in mock mode
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add methods
      getSignedJwtToken: function() {
        return getSignedJwtToken(this);
      },
      matchPassword: async function(password) {
        return await matchPassword(password, this.password);
      },
      getEmailVerificationToken: function() {
        return `mock_verification_token_${crypto.randomBytes(10).toString('hex')}`;
      },
      getResetPasswordToken: function() {
        return `mock_reset_token_${crypto.randomBytes(10).toString('hex')}`;
      },
      save: async function() {
        return this;
      }
    };
    
    // Add to users array
    users.push(newUser);
    
    return newUser;
  },
  
  // For debugging
  _getAllUsers: () => {
    return users;
  }
};

export default mockUserService; 