const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

// Define auth routes
// These will be fully implemented in Step 3

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   PUT /api/auth/reset-password/:resetToken
// @desc    Reset password with token
// @access  Public
router.put('/reset-password/:resetToken', resetPassword);

// @route   GET /api/auth/ping
// @desc    Simple endpoint to test API connectivity
// @access  Public
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth API is available',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 