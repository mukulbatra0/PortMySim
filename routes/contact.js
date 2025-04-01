const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// @route   POST /api/contact
// @desc    Submit a contact form message
// @access  Public
router.post('/', async (req, res) => {
    try {
        console.log('Received contact form submission:', req.body);
        
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create new contact message
        const contactMessage = new ContactMessage({
            name,
            email,
            phone,
            subject,
            message
        });

        // Save to database
        await contactMessage.save();
        console.log('Message saved successfully:', contactMessage);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: contactMessage
        });
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
});

module.exports = router; 