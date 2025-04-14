// Script to view contact form submissions
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Contact from '../models/Contact.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/portmysim');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// View all contacts
const viewContacts = async () => {
  try {
    await connectDB();
    
    console.log('Fetching contact form submissions...');
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    if (contacts.length === 0) {
      console.log('No contact form submissions found in the database.');
      return;
    }
    
    console.log(`Found ${contacts.length} contact form submissions:`);
    console.log('----------------------------------------');
    
    contacts.forEach((contact, index) => {
      console.log(`Submission #${index + 1}:`);
      console.log(`ID: ${contact._id}`);
      console.log(`Name: ${contact.name}`);
      console.log(`Email: ${contact.email}`);
      console.log(`Phone: ${contact.phone}`);
      console.log(`Subject: ${contact.subject}`);
      console.log(`Message: ${contact.message}`);
      console.log(`Status: ${contact.status}`);
      console.log(`Created: ${contact.createdAt}`);
      console.log('----------------------------------------');
    });
    
    process.exit(0);
  } catch (error) {
    console.error(`Error viewing contacts: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
viewContacts(); 