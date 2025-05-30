/**
 * API Server for PortMySim
 * This server provides APIs for the mobile number porting application
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Set critical environment variables with fallbacks if not defined
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not found in environment variables, using fallback for development');
  process.env.JWT_SECRET = 'portmysim_secure_jwt_secret_key_2023';
}

if (!process.env.JWT_EXPIRE) {
  console.warn('JWT_EXPIRE not found in environment variables, using default of 30 days');
  process.env.JWT_EXPIRE = '30d';
}

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import contactRoutes from './routes/contact.js';
import planRoutes from './routes/planRoutes.js';
import telecomCirclesRoutes from './routes/telecomCircles.routes.js';
import faqRoutes from './routes/faqs.routes.js';
import networkCoverageRoutes from './routes/networkCoverage.routes.js';
import portingRoutes from './routes/porting.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import mobileSmsRoutes from './routes/mobileSms.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import smsFailuresRoutes from './routes/smsFailures.routes.js';
import PortingRules from './models/PortingRules.model.js';
import portingRulesData from './data/portingRules.js';
import mongoose from 'mongoose';
import { initNotificationScheduler } from './utils/notificationService.js';
import { initializeScheduledJobs } from './utils/scheduledJobs.js';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    // Return 204 No Content if favicon doesn't exist
    res.status(204).end();
});

// Add better error handling for static files
app.use((err, req, res, next) => {
    console.error('Static file error:', err);
    if (err.code === 'ENOENT') {
        res.status(404).send('File not found');
    } else {
        next(err);
    }
});

// Improved static file serving with explicit options
app.use(express.static(path.join(__dirname, '..'), {
    fallthrough: true,
    index: false,
    etag: true,
    lastModified: true,
    maxAge: '1d',
    setHeaders: (res, path, stat) => {
        // Set proper content types for common file types to avoid MIME type issues
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        } else if (path.endsWith('.png')) {
            res.set('Content-Type', 'image/png'); 
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.set('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.svg')) {
            res.set('Content-Type', 'image/svg+xml');
        } else if (path.endsWith('.json')) {
            res.set('Content-Type', 'application/json');
        }
    }
}));

// Create explicit route for images in the providers folder since this was an issue before
app.get('/images/providers/:filename', (req, res) => {
    const filePath = path.join(__dirname, '..', 'images', 'providers', req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Error serving provider image: ${req.params.filename}`, err);
            if (err.code === 'ENOENT') {
                // If file doesn't exist, send the generic image
                res.sendFile(path.join(__dirname, '..', 'images', 'providers', 'generic.png'), (genericErr) => {
                    if (genericErr) {
                        // If generic image also fails, send a 404
                        console.error('Error serving generic fallback image', genericErr);
                        res.status(404).send('Image not found');
                    }
                });
            } else {
                res.status(500).send('Error serving image');
            }
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', planRoutes);
app.use('/api', telecomCirclesRoutes);
app.use('/api', faqRoutes);
app.use('/api', networkCoverageRoutes);
app.use('/api/porting', portingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/mobile-sms', mobileSmsRoutes);
app.use('/api/sms-failures', smsFailuresRoutes);

// Health check endpoint
app.get('/api/health/check', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
  console.log(`[API] Health check: Database ${dbConnected ? 'connected' : 'disconnected'}`);
  
  res.json({
    success: true,
    status: 'ok',
    message: 'API server is running',
    database: {
      connected: dbConnected,
      host: mongoose.connection.host || 'not connected',
      state: mongoose.STATES[mongoose.connection.readyState]
    },
    timestamp: new Date().toISOString()
  });
});

// Development-only route to reset and reinitialize porting rules
// This is useful for troubleshooting when we've changed the format of circle IDs
app.get('/api/admin/reset-porting-rules', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is not available in production'
    });
  }
  
  try {
    // Delete all existing rules
    console.log('Removing all existing porting rules');
    await PortingRules.deleteMany({});
    
    // Insert seed data
    console.log('Reinitializing porting rules with seed data');
    await PortingRules.insertMany(portingRulesData);
    
    return res.json({
      success: true,
      message: `Reinitialized database with ${portingRulesData.length} porting rules`
    });
  } catch (error) {
    console.error('Error resetting porting rules:', error);
    return res.status(500).json({
      success: false,
      error: 'Error resetting porting rules'
    });
  }
});

// Add a fallback route for any other API routes
app.get('/api/*', (req, res) => {
  console.log(`[API] Fallback for: ${req.path}`);
  res.json({
    success: false,
    error: 'Endpoint not implemented in demo server'
  });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'HTML', 'index.html'));
});

// Serve HTML files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'HTML', req.path));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize database with seed data for porting rules
async function initializePortingRules() {
  try {
    // Make sure database connection is established
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for database connection before initializing porting rules...');
      try {
        await mongoose.connection.asPromise(); // Wait for connection to be fully established
      } catch (err) {
        console.warn('Could not establish database connection, skipping porting rules initialization');
        return; // Skip initialization if database connection fails
      }
    }
    
    // Check if porting rules exist
    try {
      const rulesCount = await PortingRules.countDocuments();
      
      if (rulesCount === 0) {
        console.log('No porting rules found, initializing with seed data...');
        
        // Insert seed data
        await PortingRules.insertMany(portingRulesData);
        
        console.log(`Initialized database with ${portingRulesData.length} porting rules`);
      } else {
        console.log(`Database already contains ${rulesCount} porting rules`);
      }
    } catch (error) {
      console.error('Error checking or inserting porting rules:', error);
      console.warn('Server will continue with limited porting rule functionality');
    }
  } catch (error) {
    console.error('Error initializing porting rules:', error);
    console.warn('Server will continue with limited porting rule functionality');
  }
}

// Main async function to handle startup sequence
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Initialize porting rules after successful connection
    await initializePortingRules();
    
    // Initialize notification scheduler
    initNotificationScheduler();
    
    // Initialize scheduled jobs
    initializeScheduledJobs();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Access the API at http://localhost:${PORT}/api`);
      console.log(`Database connected: ${mongoose.connection.host}`);
    });
  } catch (err) {
    console.error('Failed to start server properly:', err);
    console.error('Database connection is required for application to function properly');
    console.error('Please check your MongoDB connection settings in .env file');
    console.error('Exiting with error code 1');
    process.exit(1);
  }
}

// Start the server
startServer();
