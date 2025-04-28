import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  googleAuth,
  facebookAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteAccount
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after an hour.'
  }
});

// Public routes for authentication
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', loginLimiter, login);

// @route   POST /api/auth/google
// @desc    Login or register with Google
// @access  Public
router.post('/google', googleAuth);

// @route   POST /api/auth/facebook
// @desc    Login or register with Facebook
// @access  Public
router.post('/facebook', facebookAuth);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', passwordResetLimiter, forgotPassword);

// @route   PUT /api/auth/reset-password/:resetToken
// @desc    Reset password with token
// @access  Public
router.put('/reset-password/:resetToken', resetPassword);

// Private routes that require authentication
// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile (name, phone)
// @access  Private
router.put('/update-profile', protect, updateProfile);

// @route   PUT /api/auth/update-email
// @desc    Update user email with verification
// @access  Private
router.put('/update-email', protect, updateEmail);

// @route   PUT /api/auth/update-password
// @desc    Update user password
// @access  Private
router.put('/update-password', protect, updatePassword);

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete('/delete-account', protect, deleteAccount);

// @route   GET /api/auth/ping
// @desc    Simple endpoint to test API connectivity
// @access  Public
router.get('/ping', (req, res) => {
  res.status(200).json({ success: true, message: 'Auth API is running' });
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

// @route   GET /api/auth/docs
// @desc    Display API documentation and fallback credentials
// @access  Public
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      login: {
        url: '/api/auth/login',
        method: 'POST',
        body: {
          email: 'string',
          password: 'string'
        },
        description: 'Log in with email and password'
      },
      register: {
        url: '/api/auth/register',
        method: 'POST',
        body: {
          name: 'string',
          email: 'string',
          phone: 'string (10 digits)',
          password: 'string (min 6 chars)'
        },
        description: 'Register a new user'
      }
    },
    fallback_credentials: {
      email: 'demo@example.com',
      password: 'Password123',
      note: 'These credentials can be used when MongoDB is not available'
    }
  });
});

export default router; 