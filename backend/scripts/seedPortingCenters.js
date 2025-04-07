require('dotenv').config();
const mongoose = require('mongoose');
const PortingCenter = require('../models/PortingCenter.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portmysim')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Define initial porting centers data
const portingCentersData = [
  {
    name: 'Airtel Store Connaught Place',
    provider: 'airtel',
    address: {
      street: 'N-16, Connaught Circus',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      formattedAddress: 'N-16, Connaught Circus, New Delhi, Delhi 110001'
    },
    location: {
      type: 'Point',
      coordinates: [77.2197, 28.6308] // [longitude, latitude]
    },
    circle: 'delhi',
    contactNumber: '01123411234',
    email: 'support.delhi@airtel.com',
    openingHours: {
      monday: '10:00 AM - 8:00 PM',
      tuesday: '10:00 AM - 8:00 PM',
      wednesday: '10:00 AM - 8:00 PM',
      thursday: '10:00 AM - 8:00 PM',
      friday: '10:00 AM - 8:00 PM',
      saturday: '10:00 AM - 8:00 PM',
      sunday: '10:00 AM - 6:00 PM'
    },
    services: ['porting', 'new connection', 'bill payment', 'customer support'],
    isActive: true
  },
  {
    name: 'Jio Store South Extension',
    provider: 'jio',
    address: {
      street: 'M-6, South Extension Part II',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110049',
      formattedAddress: 'M-6, South Extension Part II, New Delhi, Delhi 110049'
    },
    location: {
      type: 'Point',
      coordinates: [77.2257, 28.5707] // [longitude, latitude]
    },
    circle: 'delhi',
    contactNumber: '01126194000',
    email: 'care.delhi@jio.com',
    openingHours: {
      monday: '10:00 AM - 9:00 PM',
      tuesday: '10:00 AM - 9:00 PM',
      wednesday: '10:00 AM - 9:00 PM',
      thursday: '10:00 AM - 9:00 PM',
      friday: '10:00 AM - 9:00 PM',
      saturday: '10:00 AM - 9:00 PM',
      sunday: '10:00 AM - 9:00 PM'
    },
    services: ['porting', 'new connection', 'JioFiber', 'customer support'],
    isActive: true
  },
  {
    name: 'Vi Store Malviya Nagar',
    provider: 'vi',
    address: {
      street: 'Shop 12, Malviya Nagar Market',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110017',
      formattedAddress: 'Shop 12, Malviya Nagar Market, New Delhi, Delhi 110017'
    },
    location: {
      type: 'Point',
      coordinates: [77.2099, 28.5378] // [longitude, latitude]
    },
    circle: 'delhi',
    contactNumber: '01126683456',
    email: 'support.delhi@vodafoneidea.com',
    openingHours: {
      monday: '9:30 AM - 7:30 PM',
      tuesday: '9:30 AM - 7:30 PM',
      wednesday: '9:30 AM - 7:30 PM',
      thursday: '9:30 AM - 7:30 PM',
      friday: '9:30 AM - 7:30 PM',
      saturday: '9:30 AM - 7:30 PM',
      sunday: 'Closed'
    },
    services: ['porting', 'new connection', 'bill payment', 'customer support'],
    isActive: true
  },
  {
    name: 'Airtel Store Indiranagar',
    provider: 'airtel',
    address: {
      street: '100 Feet Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      formattedAddress: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038'
    },
    location: {
      type: 'Point',
      coordinates: [77.6414, 12.9784] // [longitude, latitude]
    },
    circle: 'karnataka',
    contactNumber: '08025201234',
    email: 'support.karnataka@airtel.com',
    openingHours: {
      monday: '10:00 AM - 8:00 PM',
      tuesday: '10:00 AM - 8:00 PM',
      wednesday: '10:00 AM - 8:00 PM',
      thursday: '10:00 AM - 8:00 PM',
      friday: '10:00 AM - 8:00 PM',
      saturday: '10:00 AM - 8:00 PM',
      sunday: '10:00 AM - 6:00 PM'
    },
    services: ['porting', 'new connection', 'bill payment', 'customer support'],
    isActive: true
  },
  {
    name: 'Jio Store Andheri',
    provider: 'jio',
    address: {
      street: 'Andheri West, Jogeshwari Link Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400058',
      formattedAddress: 'Andheri West, Jogeshwari Link Road, Mumbai, Maharashtra 400058'
    },
    location: {
      type: 'Point',
      coordinates: [72.8362, 19.1325] // [longitude, latitude]
    },
    circle: 'mumbai',
    contactNumber: '02228324000',
    email: 'care.mumbai@jio.com',
    openingHours: {
      monday: '10:00 AM - 9:00 PM',
      tuesday: '10:00 AM - 9:00 PM',
      wednesday: '10:00 AM - 9:00 PM',
      thursday: '10:00 AM - 9:00 PM',
      friday: '10:00 AM - 9:00 PM',
      saturday: '10:00 AM - 9:00 PM',
      sunday: '10:00 AM - 9:00 PM'
    },
    services: ['porting', 'new connection', 'JioFiber', 'customer support'],
    isActive: true
  }
  // Add more porting centers as needed
];

// Seed the database
const seedPortingCenters = async () => {
  try {
    // Delete existing data
    await PortingCenter.deleteMany({});
    console.log('Existing porting centers data deleted');
    
    // Insert new data
    const createdCenters = await PortingCenter.insertMany(portingCentersData);
    console.log(`${createdCenters.length} porting centers inserted`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error seeding porting centers data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedPortingCenters(); 