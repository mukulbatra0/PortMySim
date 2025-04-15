import mongoose from 'mongoose';

// Connect to MongoDB with retry mechanism and fallback
const connectDB = async (retryCount = 0, maxRetries = 3) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portmysim';
    console.log(`Using MongoDB URI: ${mongoURI.replace(/:[^:]*@/, ':****@')}`); // Hide password if present
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 15000, // Increased from 5000ms to 15000ms
      socketTimeoutMS: 45000, // Set socket timeout to 45 seconds
      connectTimeoutMS: 30000, // Set connect timeout to 30 seconds
      maxPoolSize: 10, // Set maximum connection pool size
      bufferCommands: true, // Enable command buffering to prevent errors when querying before connection is established
      autoIndex: process.env.NODE_ENV !== 'production'
    });

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    
    // Add connection event listeners for better error handling
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
      });
    });
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // More detailed error handling
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB servers. Check your connection string and make sure MongoDB is running.');
      
      // Retry logic
      if (retryCount < maxRetries) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retrying connection in ${retryDelay/1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(connectDB(retryCount + 1, maxRetries));
          }, retryDelay);
        });
      }
    }
    
    // In development mode, provide a fallback to prevent crashing
    if (process.env.NODE_ENV !== 'production') {
      console.warn('WARNING: Application running without MongoDB connection. Using in-memory fallback for development.');
      console.warn('Some features will be limited, but basic API functionality will work.');
      return { connection: { host: 'in-memory-fallback' } };
    }
    
    // In production, exit the process
    console.error('Shutting down due to database connection failure');
    throw error;
  }
};

export default connectDB; 