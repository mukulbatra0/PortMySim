const express = require('express');
const router = express.Router();
const telecomCircleController = require('../controllers/telecomCircleController');

// Get all telecom circles
router.get('/telecom-circles', telecomCircleController.getTelecomCircles);

// Get specific telecom circle by ID
router.get('/telecom-circles/:id', telecomCircleController.getTelecomCircleById);

// Compare operators in a specific circle
router.get('/telecom-circles/:id/compare', telecomCircleController.compareOperators);

// Get best operator for a circle based on criteria
router.get('/telecom-circles/:id/best-operator', telecomCircleController.getBestOperator);

module.exports = router; 