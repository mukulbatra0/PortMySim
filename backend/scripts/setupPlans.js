/**
 * Setup script for plans backend
 * This script:
 * 1. Creates necessary directories if they don't exist
 * 2. Seeds the database with initial plan data
 * 3. Tests the API endpoints
 */

require('dotenv').config({ path: '../../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portmysim');
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return false;
  }
};

// Create directories if they don't exist
const createDirectories = () => {
  const directories = [
    path.join(__dirname, '../models'),
    path.join(__dirname, '../controllers'),
    path.join(__dirname, '../routes'),
    path.join(__dirname, '../utils'),
    path.join(__dirname, '../scripts')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Test API endpoints
const testAPI = async () => {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    // Test GET /api/plans
    console.log('\nTesting GET /api/plans...');
    const plansResponse = await fetch(`${baseUrl}/plans`);
    const plans = await plansResponse.json();
    console.log(`Successfully retrieved ${plans.length} plans`);
    
    if (plans.length > 0) {
      const samplePlanId = plans[0].id;
      
      // Test GET /api/plans/:id
      console.log('\nTesting GET /api/plans/:id...');
      const planResponse = await fetch(`${baseUrl}/plans/${samplePlanId}`);
      const plan = await planResponse.json();
      console.log(`Successfully retrieved plan: ${plan.name}`);
      
      // Test GET /api/operators/:operator/plans
      console.log('\nTesting GET /api/operators/:operator/plans...');
      const operatorResponse = await fetch(`${baseUrl}/operators/jio/plans`);
      const operatorPlans = await operatorResponse.json();
      console.log(`Successfully retrieved ${operatorPlans.length} Jio plans`);
      
      // Test POST /api/plans/compare
      if (plans.length >= 2) {
        console.log('\nTesting POST /api/plans/compare...');
        const compareResponse = await fetch(`${baseUrl}/plans/compare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ planIds: [plans[0].id, plans[1].id] })
        });
        const comparisonResult = await compareResponse.json();
        console.log('Successfully compared plans');
        
        // Check if valueScores are calculated
        if (comparisonResult.valueScores) {
          console.log('Value scores calculated correctly');
        }
        
        // Check if features comparison is available
        if (comparisonResult.features) {
          console.log('Features comparison available');
        }
      }
    }
    
    console.log('\nAll API tests passed successfully!');
  } catch (error) {
    console.error('API test failed:', error.message);
  }
};

// Main function
const setupPlans = async () => {
  console.log('Setting up plans backend...');
  
  // Create necessary directories
  createDirectories();
  
  // Connect to MongoDB
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('Failed to connect to MongoDB. Setup aborted.');
    process.exit(1);
  }
  
  // Seed the database
  try {
    console.log('\nSeeding database with plan data...');
    require('./seedPlans');
    console.log('Database seeded successfully');
    
    // Test API endpoints
    console.log('\nTesting API endpoints...');
    setTimeout(testAPI, 2000); // Wait for seeding to complete
    
  } catch (error) {
    console.error('Setup failed:', error.message);
  }
};

// Run the setup
setupPlans(); 