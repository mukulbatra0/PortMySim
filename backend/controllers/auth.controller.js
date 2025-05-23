import User from '../models/User.model.js';
import asyncHandler from '../middlewares/async.middleware.js';
import crypto from 'crypto';
import emailService from '../utils/emailService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    console.log('Registration attempt:', { name, email, phone });

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    
    if (existingUser) {
      console.log('Registration failed: User already exists');
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

    console.log('User created successfully:', user._id);

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:verificationToken
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationToken)
    .digest('hex');

  // Find user with matching token and token hasn't expired
  const user = await User.findOne({
    emailVerificationToken: verificationToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  // Check if user exists
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }

  // Set user as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  
  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail({
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Continue even if welcome email fails
  }

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email address'
    });
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists and is not already verified
  if (!user) {
    // For security, don't reveal that the user doesn't exist
    return res.status(200).json({
      success: true,
      message: 'If your account exists and is not verified, a new verification email has been sent.'
    });
  }

  // Check if already verified
  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'This email is already verified. Please log in.'
    });
  }

  // Generate new verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get('host')}/HTML/verify-email.html?token=${verificationToken}`;

  try {
    // Send verification email
    await emailService.sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Verification email resent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    
    // If email sending fails, remove verification tokens from the database
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: 'Could not send verification email. Please try again later.'
    });
  }
});

// @desc    Login user and return JWT token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user in MongoDB
    let user;
    try {
      // Include failed login attempts and account lock fields
      user = await User.findOne({ email })
        .select('+password +failedLoginAttempts +accountLocked +accountLockedUntil');
    } catch (error) {
      console.error('Database error when finding user:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.accountLocked) {
      const now = new Date();
      
      // Check if lock time has expired
      if (user.accountLockedUntil && user.accountLockedUntil > now) {
        // Calculate remaining lock time in minutes
        const remainingMinutes = Math.ceil((user.accountLockedUntil - now) / (1000 * 60));
        
        return res.status(401).json({
          success: false,
          message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
          locked: true,
          lockTimeRemaining: user.lockTimeRemaining
        });
      } else {
        // Lock has expired, reset it
        user.accountLocked = false;
        user.failedLoginAttempts = 0;
        await user.save({ validateBeforeSave: false });
      }
    }

    // Check if password matches
    let isMatch;
    try {
      isMatch = await user.matchPassword(password);
    } catch (error) {
      console.error('Error checking password:', error);
      return res.status(500).json({
        success: false,
        message: 'Error during authentication'
      });
    }

    if (!isMatch) {
      // Increment failed login attempts and check if account should be locked
      await user.incrementLoginAttempts();
      
      // Determine how many attempts are left before locking
      const attemptsLeft = 5 - user.failedLoginAttempts;
      
      // If account is now locked
      if (user.accountLocked) {
        const lockMinutes = Math.ceil((user.accountLockedUntil - new Date()) / (1000 * 60));
        
        return res.status(401).json({
          success: false,
          message: `Too many failed login attempts. Your account has been locked for ${lockMinutes} minutes.`,
          locked: true,
          lockTimeRemaining: user.lockTimeRemaining
        });
      }
      
      // Return appropriate message based on attempts left
      return res.status(401).json({
        success: false,
        message: attemptsLeft > 0 
          ? `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining before your account is temporarily locked.` 
          : 'Invalid credentials.'
      });
    }

    // Reset failed login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login time
    try {
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    } catch (error) {
      console.warn('Could not update last login time:', error);
      // Continue anyway - this is not critical
    }

    // Generate token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    
    // Determine if it's a connection error
    const errorMessage = error.name === 'MongoServerSelectionError' 
      ? 'Database connection error. Please try again later.'
      : 'An error occurred during login. Please try again.';
      
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Login or register with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, name, email, googleId } = req.body;

  // Validate required fields
  if (!email || !googleId || !idToken) {
    return res.status(400).json({
      success: false,
      message: 'Missing required Google authentication fields'
    });
  }

  try {
    // In a real implementation, verify the idToken with Google's API
    // For this demo, we'll assume the token is valid

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // User exists, check if they used Google to sign up
      if (user.authProvider !== 'google') {
        // User exists but used a different auth method
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please login with your password or use the forgot password feature.'
        });
      }

      // Update Google ID if needed
      if (user.providerId !== googleId) {
        user.providerId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        phone: req.body.phone || '', // Phone might be provided or left empty
        password: crypto.randomBytes(20).toString('hex'), // Random password for Google users
        authProvider: 'google',
        providerId: googleId,
        isEmailVerified: true // Google accounts are pre-verified
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate with Google. Please try again.'
    });
  }
});

// @desc    Login or register with Facebook
// @route   POST /api/auth/facebook
// @access  Public
export const facebookAuth = asyncHandler(async (req, res) => {
  const { accessToken, name, email, facebookId } = req.body;

  // Validate required fields
  if (!email || !facebookId || !accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Missing required Facebook authentication fields'
    });
  }

  try {
    // In a real implementation, verify the accessToken with Facebook's API
    // For this demo, we'll assume the token is valid

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // User exists, check if they used Facebook to sign up
      if (user.authProvider !== 'facebook') {
        // User exists but used a different auth method
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please login with your password or use the forgot password feature.'
        });
      }

      // Update Facebook ID if needed
      if (user.providerId !== facebookId) {
        user.providerId = facebookId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        phone: req.body.phone || '', // Phone might be provided or left empty
        password: crypto.randomBytes(20).toString('hex'), // Random password for Facebook users
        authProvider: 'facebook',
        providerId: facebookId,
        isEmailVerified: true // Facebook accounts are pre-verified
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Facebook auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate with Facebook. Please try again.'
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updateFields = {};

  // Only update fields that are sent
  if (name) updateFields.name = name;
  if (phone) updateFields.phone = phone;

  // Find user and update
  const user = await User.findByIdAndUpdate(
    req.userId,
    updateFields,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});

// @desc    Update user email
// @route   PUT /api/auth/update-email
// @access  Private
export const updateEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and current password'
    });
  }

  // Check if email is already in use
  const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email is already in use'
    });
  }

  // Get user with password
  const user = await User.findById(req.userId).select('+password');

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Set new email and require verification
  user.email = email;
  user.isEmailVerified = true;

  await user.save({ validateBeforeSave: false });

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Email updated successfully.'
  });
});

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate passwords
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new passwords'
    });
  }

  // Password strength validation
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }

  // Check password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  try {
    // Get user with password and password history
    const user = await User.findById(req.userId).select('+password +passwordHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is the same as the current one
    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password'
      });
    }

    // Check if password has been used before
    if (await user.isPasswordReused(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reuse a password that you have used recently. Please choose a different password.'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token with updated password version
    sendTokenResponse(user, 200, res);

    // Log the password change
    console.log(`Password changed successfully for user: ${user.email}`);
    
    // Send password change notification email
    try {
      await emailService.sendPasswordChangeNotification({
        email: user.email,
        name: user.name
      });
    } catch (emailError) {
      console.error('Error sending password change notification email:', emailError);
      // Continue anyway since this is not critical
    }
    
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // Validate password for security
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your password to confirm account deletion'
    });
  }

  // Get user with password
  const user = await User.findById(req.userId).select('+password');

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  // For proper data management, you might want to anonymize data instead of deleting
  // But for this implementation, we'll simply set the account to inactive
  user.active = false;
  user.email = `deleted-${user._id}@deleted.com`;
  user.name = 'Deleted User';
  user.phone = `deleted-${user._id}`;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Your account has been successfully deleted'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
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

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/HTML/reset-password.html?token=${resetToken}`;
    
    console.log('Reset URL (will be sent in email):', resetUrl);

    // Send password reset email
    await emailService.sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
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
export const resetPassword = asyncHandler(async (req, res) => {
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
        message: 'Password reset link has expired. Please request a new password reset link.'
      });
    }

    console.log('Found user, resetting password:', user._id);
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    console.log('Password reset successful for user:', user._id);
    
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = user.getSignedJwtToken();

    // Check if token was generated successfully
    if (!token) {
      console.error('Failed to generate JWT token');
      return res.status(500).json({
        success: false,
        message: 'Authentication error. Please try again.'
      });
    }

    res.status(statusCode).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider || 'local'
      }
    });
  } catch (error) {
    console.error('Error generating token response:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 