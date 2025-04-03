const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portmysim';
    console.log(`Using MongoDB URI: ${mongoURI.replace(/:[^:]*@/, ':****@')}`); // Hide password if present
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      // Use the appropriate options for your mongoose version
      // Auto index is costly in production but helpful in development
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // More detailed error handling
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB servers. Check your connection string and make sure MongoDB is running.');
    } else if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Check your MONGODB_URI environment variable.');
    }
    
    // Only exit in production, allow dev server to continue running
    if (process.env.NODE_ENV === 'production') {
      console.error('Shutting down due to database connection failure');
      process.exit(1);
    } else {
      console.warn('WARNING: Application running without database connection. Some features will not work.');
      return null;
    }
  }
};

module.exports = connectDB; 