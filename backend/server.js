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

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB but don't crash if it fails
connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    console.warn('Server will continue running with limited functionality using in-memory database');
    console.warn('Predefined test user: demo@example.com / Password123');
    // Don't exit the process on connection failure
});

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

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

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

// Mock API endpoint for telecom providers
app.get('/api/porting/providers', (req, res) => {
  console.log('[API] Serving providers data');
  
  // Return sample provider data
  res.json({
    success: true,
    data: [
      {
        id: 'jio',
        name: 'Jio',
        description: 'Affordable plans & digital benefits',
        logo: '../images/jio.jpeg'
      },
      {
        id: 'airtel',
        name: 'Airtel',
        description: 'Wide coverage & great speeds',
        logo: '../images/airtel.png'
      },
      {
        id: 'vi',
        name: 'Vi',
        description: 'Weekend data & entertainment',
        logo: '../images/vi.png'
      },
      {
        id: 'bsnl',
        name: 'BSNL',
        description: 'Extensive rural coverage',
        logo: '../images/bsnl.png'
      }
    ]
  });
});

// Mock API endpoint for telecom circles
app.get('/api/porting/circles', (req, res) => {
  console.log('[API] Serving circles data');
  
  // Return sample circle data
  res.json({
    success: true,
    data: [
      { id: 'delhi', name: 'Delhi NCR' },
      { id: 'mumbai', name: 'Mumbai' },
      { id: 'maharashtra', name: 'Maharashtra & Goa' },
      { id: 'karnataka', name: 'Karnataka' },
      { id: 'tamil-nadu', name: 'Tamil Nadu' },
      { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
      { id: 'west-bengal', name: 'West Bengal' },
      { id: 'gujarat', name: 'Gujarat' },
      { id: 'kolkata', name: 'Kolkata' },
      { id: 'up-east', name: 'UP East' },
      { id: 'up-west', name: 'UP West' },
      { id: 'kerala', name: 'Kerala' },
      { id: 'punjab', name: 'Punjab' },
      { id: 'haryana', name: 'Haryana' },
      { id: 'rajasthan', name: 'Rajasthan' },
      { id: 'madhya-pradesh', name: 'Madhya Pradesh & Chhattisgarh' },
      { id: 'bihar', name: 'Bihar & Jharkhand' },
      { id: 'orissa', name: 'Orissa' },
      { id: 'assam', name: 'Assam' },
      { id: 'northeast', name: 'North East' },
      { id: 'himachal', name: 'Himachal Pradesh' },
      { id: 'jammu', name: 'Jammu & Kashmir' }
    ]
  });
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 