require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const TelecomCircle = require('../models/TelecomCircle.model');
const telecomCircles = require('../data/telecomCircles');

// Connect to database
connectDB()
  .then(async () => {
    try {
      // Clear existing telecom circles
      await TelecomCircle.deleteMany({});
      console.log('✅ Existing telecom circles deleted');

      // Insert new telecom circles
      const insertedCircles = await TelecomCircle.insertMany(telecomCircles);
      console.log(`✅ ${insertedCircles.length} telecom circles seeded successfully`);

      console.log('✅ Telecom circles seed operation completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding telecom circles database:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 