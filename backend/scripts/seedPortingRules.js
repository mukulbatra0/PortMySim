require('dotenv').config();
const mongoose = require('mongoose');
const PortingRules = require('../models/PortingRules.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portmysim')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Define initial porting rules data
const portingRulesData = [
  {
    circle: 'delhi',
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date('2023-01-26'), description: 'Republic Day' },
      { date: new Date('2023-08-15'), description: 'Independence Day' },
      { date: new Date('2023-10-02'), description: 'Gandhi Jayanti' }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: 'Send PORT <space> <mobile number> to 1900 to get your UPC code. The UPC code is valid for 4 days.',
    active: true
  },
  {
    circle: 'mumbai',
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date('2023-01-26'), description: 'Republic Day' },
      { date: new Date('2023-08-15'), description: 'Independence Day' },
      { date: new Date('2023-10-02'), description: 'Gandhi Jayanti' }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: 'Send PORT <space> <mobile number> to 1900 to get your UPC code. The UPC code is valid for 4 days.',
    active: true
  },
  {
    circle: 'karnataka',
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date('2023-01-26'), description: 'Republic Day' },
      { date: new Date('2023-08-15'), description: 'Independence Day' },
      { date: new Date('2023-10-02'), description: 'Gandhi Jayanti' },
      { date: new Date('2023-11-01'), description: 'Karnataka Rajyotsava' }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: 'Send PORT <space> <mobile number> to 1900 to get your UPC code. The UPC code is valid for 4 days.',
    active: true
  },
  // Add more circles as needed
];

// Seed the database
const seedPortingRules = async () => {
  try {
    // Delete existing data
    await PortingRules.deleteMany({});
    console.log('Existing porting rules data deleted');
    
    // Insert new data
    const createdRules = await PortingRules.insertMany(portingRulesData);
    console.log(`${createdRules.length} porting rules inserted`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error seeding porting rules data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedPortingRules(); 