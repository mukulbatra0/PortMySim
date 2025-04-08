import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

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
  res.json({
    success: true,
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    server: {
      version: process.version,
      platform: process.platform,
      port: process.env.PORT || 5000,
      memory: process.memoryUsage()
    }
  });
});

// @route   GET /api/auth/port
// @desc    Return the current API port for frontend detection
// @access  Public
router.get('/port', (req, res) => {
  res.json({
    success: true,
    port: parseInt(process.env.PORT || 5000)
  });
});

export default router; 