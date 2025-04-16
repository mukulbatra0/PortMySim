import express from 'express';
import Contact from '../models/Contact.model.js';

const router = express.Router();

// Contact form submission endpoint
router.post('/submit', async (req, res) => {
  try {
    console.log('Received contact form data:', req.body);
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      console.log('Missing required fields in contact form submission');
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }
    
    // Create new contact entry
    const contactData = {
      name,
      email,
      phone,
      subject,
      message,
      status: 'new'
    };
    
    console.log('Creating new contact with data:', contactData);
    
    // Save to database
    const newContact = new Contact(contactData);
    
    // Using try-catch for mongoose validation errors
    try {
      const savedContact = await newContact.save();
      console.log('Contact saved successfully:', savedContact._id);
      
      return res.status(201).json({ 
        success: true, 
        message: 'Your message has been received. We will contact you soon!',
        data: savedContact._id
      });
    } catch (dbError) {
      console.error('Database validation error:', dbError);
      
      // Handle mongoose validation errors
      if (dbError.name === 'ValidationError') {
        const validationErrors = {};
        
        // Extract validation error messages
        for (const field in dbError.errors) {
          validationErrors[field] = dbError.errors[field].message;
        }
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      throw dbError; // Re-throw for general error handler
    }
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred while processing your request',
      error: error.message 
    });
  }
});

// Simple GET endpoint to test if the route is working
router.get('/test', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Contact routes are working properly' 
  });
});

export default router; 