import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import asyncHandler from './async.middleware.js';
import mockUserService from '../utils/mockUserService.js';

// Track if we're using mock DB
let usingMockDB = false;

// Helper function to get the appropriate user model
const getUserModel = () => {
  if (usingMockDB) {
    console.log('Auth middleware using mock user service');
    return mockUserService;
  }
  return User;
};

/**
 * Middleware to protect routes - validates JWT token and adds user info to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
    } 
    // Check if token exists in cookies (for web app)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this resource, no token provided'
        });
    }

    try {
        // Get JWT secret with fallback
        const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only';
        
        // Verify token
        const decoded = jwt.verify(token, jwtSecret);
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(401).json({
                success: false,
                message: 'Token has expired, please login again'
            });
        }
        
        // Get appropriate user model
        let UserModel = getUserModel();
        
        try {
            // Find user by ID (to ensure they still exist and get latest role)
            var user = await UserModel.findById(decoded.id);
        } catch (error) {
            console.error('Error finding user in database:', error);
            
            // If MongoDB connection failed, fall back to mock user service
            if (!usingMockDB) {
                console.log('Auth middleware falling back to mock user service');
                usingMockDB = true;
                UserModel = getUserModel();
                user = await UserModel.findById(decoded.id);
            } else {
                throw error; // If already using mock DB, re-throw the error
            }
        }
        
        // Check if user still exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'The user belonging to this token no longer exists'
            });
        }
        
        // Add user info to request
        req.userId = decoded.id;
        req.userRole = user.role; // Use role from database (most up-to-date)
        req.user = user; // Attach full user object (excluding password)
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        let message = 'Not authorized, invalid token';
        if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token format';
        } else if (error.name === 'TokenExpiredError') {
            message = 'Token has expired, please login again';
        }
        
        return res.status(401).json({
            success: false,
            message
        });
    }
});

/**
 * Middleware to restrict access to admin users only
 * Must be used after the protect middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const admin = asyncHandler(async (req, res, next) => {
    // Check if user is admin
    if (req.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access forbidden: Admin role required for this resource'
        });
    }
    
    next();
});

/**
 * Middleware to restrict access to specific roles
 * Must be used after the protect middleware
 * @param {String[]} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access forbidden: Your role (${req.userRole}) is not authorized to access this resource`
            });
        }
        next();
    };
}; 