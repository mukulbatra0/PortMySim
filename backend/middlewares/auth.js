const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

/**
 * Authentication middleware for protected routes
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const secret = JWT_SECRET || 'portmysim_jwt_secret_dev_only';
    const decoded = jwt.verify(token, secret);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

module.exports = auth; 