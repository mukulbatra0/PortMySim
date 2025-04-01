const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User.model');
const Plan = require('../models/Plan.model');
const PortingRequest = require('../models/PortingRequest.model');
const Contact = require('../models/Contact.model');
const FAQ = require('../models/FAQ.model');
const bcrypt = require('bcryptjs');

// Sample data
const users = require('../data/users');
const plans = require('../data/plans');
const faqs = require('../data/faqs');

// Load env variables
dotenv.config();

// Function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Import data into DB
const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany();
    await Plan.deleteMany();
    await PortingRequest.deleteMany();
    await Contact.deleteMany();
    await FAQ.deleteMany();

    console.log('Cleared existing data');

    // Hash passwords for users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        return {
          ...user,
          password: await hashPassword(user.password)
        };
      })
    );

    // Import users
    await User.insertMany(hashedUsers);
    console.log('Users imported');

    // Import plans
    await Plan.insertMany(plans);
    console.log('Plans imported');

    // Import FAQs
    await FAQ.insertMany(faqs);
    console.log('FAQs imported');

    console.log('Data Import Successful');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete all data from DB
const destroyData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();
    await Plan.deleteMany();
    await PortingRequest.deleteMany();
    await Contact.deleteMany();
    await FAQ.deleteMany();

    console.log('Data Destroyed');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Call functions based on command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 