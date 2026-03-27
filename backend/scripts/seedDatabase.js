import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Plan from '../models/Plan.js';
import FAQ from '../models/FAQ.model.js';
import TelecomCircle from '../models/TelecomCircle.model.js';
import plans from '../data/plans.js';
import faqs from '../data/faqs.js';
import telecomCircles from '../data/telecomCircles.js';
import planHelper from '../utils/planHelper.js';

dotenv.config();

console.log('Starting database seeding process...');

// Seed Plans
async function seedPlans() {
  try {
    console.log('Seeding plans...');
    await Plan.deleteMany({});
    console.log('✅ Existing plans deleted');

    const processedPlans = plans.map(plan => ({
      ...plan,
      data_value: plan.data_value || planHelper.parseDataValue(plan.data),
      data_category: plan.data_category || planHelper.getDataCategory(plan.data),
      price_category: plan.price_category || planHelper.getPriceCategory(plan.price),
      validity_category: plan.validity_category || planHelper.getValidityCategory(plan.validity),
      image: plan.image || planHelper.getOperatorImage(plan.operator)
    }));

    const insertedPlans = await Plan.insertMany(processedPlans);
    console.log(`✅ ${insertedPlans.length} plans seeded successfully`);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    throw error;
  }
}

// Seed FAQs
async function seedFAQs() {
  try {
    console.log('Seeding FAQs...');
    await FAQ.deleteMany({});
    console.log('✅ Existing FAQs deleted');

    const insertedFAQs = await FAQ.insertMany(faqs);
    console.log(`✅ ${insertedFAQs.length} FAQs seeded successfully`);
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    throw error;
  }
}

// Seed Telecom Circles
async function seedTelecomCircles() {
  try {
    console.log('Seeding telecom circles...');
    await TelecomCircle.deleteMany({});
    console.log('✅ Existing telecom circles deleted');

    const insertedCircles = await TelecomCircle.insertMany(telecomCircles);
    console.log(`✅ ${insertedCircles.length} telecom circles seeded successfully`);
  } catch (error) {
    console.error('❌ Error seeding telecom circles:', error);
    throw error;
  }
}

// Run all seed functions sequentially
async function seedAll() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Seed all data
    await seedPlans();
    await seedFAQs();
    await seedTelecomCircles();

    console.log('✅ All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedAll(); 