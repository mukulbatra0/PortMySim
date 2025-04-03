require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Plan = require('../models/Plan');
const plans = require('../data/plans');
const planHelper = require('../utils/planHelper');

// Connect to database
connectDB()
  .then(async () => {
    try {
      // Clear existing plans
      await Plan.deleteMany({});
      console.log('✅ Existing plans deleted');

      // Insert new plans
      const insertedPlans = await Plan.insertMany(plans);
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

// Sample plans data
const plansData = [
  // Jio Plans
  {
    operator: 'jio',
    name: 'Jio Premium',
    price: 299,
    data: '2GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: true,
    subscriptions: ['Disney+ Hotstar'],
    network_coverage: 98,
    data_speed: 50,
    extra_benefits: ['JioTV access'],
    plan_type: 'prepaid',
    recommendation: 'Best Value'
  },
  {
    operator: 'jio',
    name: 'Jio Standard',
    price: 199,
    data: '1.5GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: true,
    subscriptions: [],
    network_coverage: 98,
    data_speed: 50,
    extra_benefits: ['JioTV access'],
    plan_type: 'prepaid',
    recommendation: ''
  },
  {
    operator: 'jio',
    name: 'Jio Unlimited',
    price: 399,
    data: '3GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: true,
    subscriptions: ['Disney+ Hotstar', 'JioCinema Premium'],
    network_coverage: 98,
    data_speed: 50,
    extra_benefits: ['JioTV access', 'JioCloud'],
    plan_type: 'prepaid',
    recommendation: ''
  },
  
  // Airtel Plans
  {
    operator: 'airtel',
    name: 'Airtel Smart',
    price: 349,
    data: '2.5GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: true,
    subscriptions: ['Amazon Prime'],
    network_coverage: 99,
    data_speed: 100,
    extra_benefits: ['Airtel Xstream access'],
    plan_type: 'prepaid',
    recommendation: 'Best Data'
  },
  {
    operator: 'airtel',
    name: 'Airtel Basic',
    price: 179,
    data: '1GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: false,
    subscriptions: [],
    network_coverage: 99,
    data_speed: 60,
    extra_benefits: [],
    plan_type: 'prepaid',
    recommendation: ''
  },
  {
    operator: 'airtel',
    name: 'Airtel Max',
    price: 499,
    data: '3.5GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: true,
    subscriptions: ['Amazon Prime', 'Wynk Premium'],
    network_coverage: 99,
    data_speed: 100,
    extra_benefits: ['Airtel Xstream access', 'Apollo 24|7 Circle'],
    plan_type: 'prepaid',
    recommendation: ''
  },
  
  // Vi Plans
  {
    operator: 'vi',
    name: 'Vi Basic',
    price: 249,
    data: '1.5GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: false,
    subscriptions: ['Vi Movies & TV'],
    network_coverage: 92,
    data_speed: 40,
    extra_benefits: ['Weekend data rollover'],
    plan_type: 'prepaid',
    recommendation: 'Budget Choice'
  },
  {
    operator: 'vi',
    name: 'Vi Value',
    price: 299,
    data: '2GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: true,
    subscriptions: ['Vi Movies & TV'],
    network_coverage: 92,
    data_speed: 50,
    extra_benefits: ['Weekend data rollover'],
    plan_type: 'prepaid',
    recommendation: ''
  },
  {
    operator: 'vi',
    name: 'Vi Premium',
    price: 399,
    data: '2.5GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: true,
    subscriptions: ['Vi Movies & TV', 'SonyLIV Premium'],
    network_coverage: 92,
    data_speed: 60,
    extra_benefits: ['Weekend data rollover', 'Binge All Night'],
    plan_type: 'prepaid',
    recommendation: ''
  },
  
  // BSNL Plans
  {
    operator: 'bsnl',
    name: 'BSNL Budget',
    price: 99,
    data: '1GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: false,
    subscriptions: [],
    network_coverage: 85,
    data_speed: 30,
    extra_benefits: [],
    plan_type: 'prepaid',
    recommendation: ''
  },
  {
    operator: 'bsnl',
    name: 'BSNL Value',
    price: 199,
    data: '2GB/day',
    validity: 28,
    voice_calls: 'Unlimited',
    sms: '100/day',
    has_5g: false,
    subscriptions: [],
    network_coverage: 85,
    data_speed: 30,
    extra_benefits: [],
    plan_type: 'prepaid',
    recommendation: ''
  }
];

// Process plans and add derived fields
const processedPlans = plansData.map(plan => {
  return {
    ...plan,
    data_value: planHelper.parseDataValue(plan.data),
    data_category: planHelper.getDataCategory(plan.data),
    price_category: planHelper.getPriceCategory(plan.price),
    validity_category: planHelper.getValidityCategory(plan.validity),
    image: planHelper.getOperatorImage(plan.operator)
  };
});

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Delete existing plans
    await Plan.deleteMany({});
    console.log('Deleted existing plans');
    
    // Insert new plans
    await Plan.insertMany(processedPlans);
    console.log(`Inserted ${processedPlans.length} plans`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 