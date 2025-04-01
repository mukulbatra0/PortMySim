const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const asyncHandler = require('./async.middleware');

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user id to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
});

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  // Get user from database (to ensure role is up-to-date)
  const user = await User.findById(req.userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
  
  next();
});

module.exports = { protect, admin }; 