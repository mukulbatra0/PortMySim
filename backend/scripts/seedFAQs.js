require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const FAQ = require('../models/FAQ.model');
const faqs = require('../data/faqs');

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