const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Get all FAQs with optional category filter
router.get('/faqs', faqController.getAllFAQs);

// Get FAQs by category
router.get('/faqs/categories/:category', faqController.getFAQsByCategory);

// Search FAQs
router.get('/faqs/search', faqController.searchFAQs);

// Get top FAQs
router.get('/faqs/top', faqController.getTopFAQs);

module.exports = router; 