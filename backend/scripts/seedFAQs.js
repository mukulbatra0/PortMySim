import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import FAQ from '../models/FAQ.model.js';
import faqs from '../data/faqs.js';

dotenv.config();

// Connect to database
connectDB()
  .then(async () => {
    try {
      // Clear existing FAQs
      await FAQ.deleteMany({});
      console.log('✅ Existing FAQs deleted');

      // Insert new FAQs
      const insertedFAQs = await FAQ.insertMany(faqs);
      console.log(`✅ ${insertedFAQs.length} FAQs seeded successfully`);

      console.log('✅ FAQ seed operation completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding FAQ database:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 