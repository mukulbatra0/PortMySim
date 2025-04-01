const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Set default port
const PORT = process.env.PORT || 5000;

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/porting', require('./routes/porting.routes'));
app.use('/api/plans', require('./routes/plans.routes'));
app.use('/api/contact', require('./routes/contact.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PortMySim API' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

module.exports = app; 