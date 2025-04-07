const User = require('../models/User.model');
const asyncHandler = require('../middlewares/async.middleware');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or phone already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  // Generate token
  sendTokenResponse(user, 201, res);
});

// @desc    Login user and return JWT token
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate token
  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  console.log('Forgot password request received:', req.body);
  
  // Validate email
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address'
    });
  }

  try {
    // Find user with that email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      console.log('No user found with email:', req.body.email);
      // Still return success to prevent email enumeration attacks
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    
    console.log('Generated reset token for user:', user._id);

    await user.save({ validateBeforeSave: false });

    // Create reset URL (in production this would be sent in an email)
    const resetUrl = `${req.protocol}://${req.get('host')}/HTML/reset-password.html?token=${resetToken}`;
    
    console.log('Reset URL (would be sent in email):', resetUrl);

    // In a real application, you would send an email here
    // For now, we'll just return the token in the response
    res.status(200).json({
      success: true,
      message: 'Password reset initiated. In production, an email would be sent.',
      data: {
        resetToken,
        resetUrl
      }
    });
  } catch (error) {
    console.error('Error in forgot password process:', error);
    
    // If there was an error, clean up the reset token fields
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Could not send password reset email. Please try again later.'
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  console.log('Reset password request received for token:', req.params.resetToken);
  
  // Validate request parameters
  if (!req.params.resetToken) {
    return res.status(400).json({
      success: false,
      message: 'Reset token is required'
    });
  }
  
  // Validate password
  if (!req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a new password'
    });
  }
  
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
      
    console.log('Looking for user with hashed token:', resetPasswordToken);

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log('No user found with valid reset token');
      return res.status(400).json({
        success: false,
        message: 'Invalid token or token has expired'
      });
    }

    console.log('Found user, resetting password:', user._id);
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // Generate new auth token for auto-login
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error in reset password process:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
}; 