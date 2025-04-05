require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');
const planRoutes = require('./routes/planRoutes');
const telecomCirclesRoutes = require('./routes/telecomCircles.routes');
const faqRoutes = require('./routes/faqs.routes');
const networkCoverageRoutes = require('./routes/networkCoverage.routes');

const app = express();

// Connect to MongoDB with error handling
connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});

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

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api', planRoutes);
app.use('/api', telecomCirclesRoutes);
app.use('/api', faqRoutes);
app.use('/api', networkCoverageRoutes);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
}); 