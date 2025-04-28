import mongoose from 'mongoose';

// Connect to MongoDB with retry mechanism
const connectDB = async (retryCount = 0, maxRetries = 5) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portmysim';
    console.log(`Using MongoDB URI: ${mongoURI.replace(/:[^:]*@/, ':****@')}`); // Hide password if present
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 60000, // Increased timeout
      connectTimeoutMS: 45000, // Increased timeout
      maxPoolSize: 50, // Increased for better performance
      minPoolSize: 5, // Ensure minimum connections
      bufferCommands: true,
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
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
    // Handle graceful shutdown - updated to use modern approach without callbacks
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB connection close:', err);
        process.exit(1);
      }
    });
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // More detailed error handling
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB servers. Check your connection string and make sure MongoDB is running.');
      
      // Retry logic with exponential backoff
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
    
    // Instead of fallback, throw error to properly handle at application level
    console.error('Failed to connect to MongoDB after multiple attempts. Application cannot start without database connection.');
    throw new Error('Database connection failed: ' + error.message);
  }
};

export default connectDB; 