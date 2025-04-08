/**
 * Simple API Server for PortMySim - No MongoDB Required
 * This server provides basic API functionality without database dependency
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: '*', // Allow all origins for now
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Simple ping endpoint for connection testing
app.get('/api/auth/ping', (req, res) => {
    res.json({
        success: true,
        message: 'API server is running (Simple Mode)',
        timestamp: new Date().toISOString(),
        server: {
            version: process.version,
            platform: process.platform,
            port: process.env.PORT || 5000,
            mode: 'simple-fallback'
        }
    });
});

// Simple port endpoint for connection testing
app.get('/api/auth/port', (req, res) => {
    res.json({
        success: true,
        port: parseInt(process.env.PORT || 5000)
    });
});

// Mock provider data endpoint
app.get('/api/porting/providers', (req, res) => {
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

// Mock circles data endpoint
app.get('/api/telecom-circles', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 'delhi', name: 'Delhi NCR' },
            { id: 'mumbai', name: 'Mumbai' },
            { id: 'maharashtra', name: 'Maharashtra & Goa' },
            { id: 'karnataka', name: 'Karnataka' },
            { id: 'tamil-nadu', name: 'Tamil Nadu' },
            { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
            { id: 'west-bengal', name: 'West Bengal' }
        ]
    });
});

// Mock network coverage endpoint
app.get('/api/network-coverage', (req, res) => {
    res.json({
        success: true,
        data: {
            jio: { coverage: 98, speed: 25, callQuality: 4.5 },
            airtel: { coverage: 95, speed: 35, callQuality: 4.7 },
            vi: { coverage: 90, speed: 20, callQuality: 4.2 },
            bsnl: { coverage: 85, speed: 15, callQuality: 3.8 }
        }
    });
});

// Fallback for all other API routes
app.all('/api/*', (req, res) => {
    res.json({
        success: true,
        message: 'Simple API server is running. This endpoint is not implemented in simple mode.',
        endpoint: req.path
    });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'HTML', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Simple API server running on port ${PORT}`);
    console.log(`No MongoDB connection required for this simple mode`);
    console.log(`Access the application at http://localhost:${PORT}`);
}); 