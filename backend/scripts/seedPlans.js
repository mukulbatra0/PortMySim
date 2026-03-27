import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Plan from '../models/Plan.js';
import plans from '../data/plans.js';
import planHelper from '../utils/planHelper.js';

dotenv.config();

// Connect to database
connectDB()
  .then(async () => {
    try {
      // Clear existing plans
      await Plan.deleteMany({});
      console.log('✅ Existing plans deleted');

      // Process plans to ensure all fields are complete
      const processedPlans = plans.map(plan => {
        // Only add derived fields if they don't exist
        return {
          ...plan,
          data_value: plan.data_value || planHelper.parseDataValue(plan.data),
          data_category: plan.data_category || planHelper.getDataCategory(plan.data),
          price_category: plan.price_category || planHelper.getPriceCategory(plan.price),
          validity_category: plan.validity_category || planHelper.getValidityCategory(plan.validity),
          image: plan.image || planHelper.getOperatorImage(plan.operator)
        };
      });

      // Insert new plans
      const insertedPlans = await Plan.insertMany(processedPlans);
      console.log(`✅ ${insertedPlans.length} plans seeded successfully`);

      // Calculate value scores for all plans
      for (const plan of insertedPlans) {
        const valueScore = plan.calculateValueScore();
        console.log(`Plan: ${plan.name}, Value Score: ${valueScore}`);
      }

      console.log('✅ Seed operation completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 