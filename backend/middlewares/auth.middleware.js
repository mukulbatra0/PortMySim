import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import asyncHandler from './async.middleware.js';

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
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(401).json({
                success: false,
                message: 'Token has expired, please login again'
            });
        }
        
        // Find user by ID (to ensure they still exist and get latest role)
        const user = await User.findById(decoded.id);
        
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