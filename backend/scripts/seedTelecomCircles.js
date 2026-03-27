import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import TelecomCircle from '../models/TelecomCircle.model.js';
import telecomCircles from '../data/telecomCircles.js';

dotenv.config();

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