/**
 * Seed Network Coverage Data
 * This script populates the database with sample network coverage data
 * 
 * Run with: node scripts/seedNetworkCoverage.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const NetworkCoverage = require('../models/NetworkCoverage.model');
const connectDB = require('../config/db');

// Sample locations with coordinates
const locations = [
  { name: 'New Delhi', state: 'Delhi', coords: [77.1025, 28.7041] }, // MongoDB uses [lng, lat]
  { name: 'Mumbai', state: 'Maharashtra', coords: [72.8777, 19.0760] },
  { name: 'Chennai', state: 'Tamil Nadu', coords: [80.2707, 13.0827] },
  { name: 'Kolkata', state: 'West Bengal', coords: [88.3639, 22.5726] },
  { name: 'Bangalore', state: 'Karnataka', coords: [77.5946, 12.9716] },
  { name: 'Hyderabad', state: 'Telangana', coords: [78.4867, 17.3850] },
  { name: 'Pune', state: 'Maharashtra', coords: [73.8567, 18.5204] },
  { name: 'Ahmedabad', state: 'Gujarat', coords: [72.5714, 23.0225] },
  { name: 'Jaipur', state: 'Rajasthan', coords: [75.7873, 26.9124] },
  { name: 'Lucknow', state: 'Uttar Pradesh', coords: [80.9462, 26.8467] }
];

// Operators for which we'll create data
const operators = ['jio', 'airtel', 'vi'];

// Technology types (4G, 5G)
const techTypes = ['4g', '5g'];

/**
 * Generate network coverage data for all locations
 * @returns {Array} Array of network coverage documents
 */
function generateNetworkCoverageData() {
  const coverageData = [];

  // For each location, create coverage data for all operators and tech types
  locations.forEach(location => {
    // For name-based deterministic data generation
    const locationSeed = location.name.charCodeAt(0) + location.name.length;
    
    operators.forEach(operator => {
      techTypes.forEach(techType => {
        // Add variation based on operator
        let operatorBonus = 0;
        if (operator === 'jio') {
          operatorBonus = 5; // Make Jio slightly better in some areas
        } else if (operator === 'airtel') {
          operatorBonus = 8; // Make Airtel slightly better in other areas
        }
        
        // Calculate data values with some variability
        const signalStrength = techType === '4g' 
          ? 80 + (locationSeed % 15) + (operatorBonus % 10)
          : 60 + (locationSeed % 30) + (operatorBonus % 5);
        
        const downloadSpeed = techType === '4g'
          ? 18 + (locationSeed % 15) + operatorBonus
          : 220 + (locationSeed % 150) + (operatorBonus * 10);
        
        const uploadSpeed = techType === '4g'
          ? 5 + (locationSeed % 5) + (operatorBonus / 2)
          : 50 + (locationSeed % 30) + operatorBonus;
        
        const callQuality = 3.5 + ((locationSeed % 10) / 10) + (operatorBonus / 20);
        const indoorReception = 3.2 + ((locationSeed % 12) / 10) + (operatorBonus / 25);
        const congestionHandling = 3.0 + ((locationSeed % 8) / 10) + (operatorBonus / 30);
        const customerSatisfaction = 3.3 + ((locationSeed % 14) / 10) + (operatorBonus / 22);
        
        // Create coverage document
        coverageData.push({
          location: location.name,
          locationCoordinates: {
            type: 'Point',
            coordinates: location.coords
          },
          coverageRadius: 5 + (locationSeed % 5),
          operator,
          technologyType: techType,
          signalStrength: Math.min(100, Math.round(signalStrength)),
          downloadSpeed: Math.round(downloadSpeed * 10) / 10,
          uploadSpeed: Math.round(uploadSpeed * 10) / 10,
          callQuality: Math.min(5, Math.round(callQuality * 10) / 10),
          indoorReception: Math.min(5, Math.round(indoorReception * 10) / 10),
          congestionHandling: Math.min(5, Math.round(congestionHandling * 10) / 10),
          customerSatisfaction: Math.min(5, Math.round(customerSatisfaction * 10) / 10)
        });
      });
    });
  });

  return coverageData;
}

/**
 * Seed the database
 */
async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await NetworkCoverage.deleteMany({});
    console.log('Cleared existing network coverage data');

    // Generate new data
    const coverageData = generateNetworkCoverageData();
    console.log(`Generated ${coverageData.length} network coverage documents`);

    // Insert data
    const insertedData = await NetworkCoverage.insertMany(coverageData);
    console.log(`Inserted ${insertedData.length} documents into database`);

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 