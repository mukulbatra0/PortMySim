const express = require('express');
const router = express.Router();
const {
  submitPortingRequest,
  getUserPortingRequests,
  getPortingStatus,
  getServiceProviders,
  getTelecomCircles,
  findNearbyPortingCenters,
  calculatePortingDates,
  getPortingRules,
  toggleAutomatedPorting
} = require('../controllers/porting.controller');
const { protect } = require('../middlewares/auth.middleware');

// Define porting routes
// These will be fully implemented in Step 5

// @route   POST /api/porting/submit
// @desc    Submit a new porting request
// @access  Private
router.post('/submit', protect, submitPortingRequest);

// @route   GET /api/porting/requests
// @desc    Get all porting requests for a user
// @access  Private
router.get('/requests', protect, getUserPortingRequests);

// @route   GET /api/porting/status/:id
// @desc    Get status of a specific porting request
// @access  Private
router.get('/status/:id', protect, getPortingStatus);

// @route   POST /api/porting/centers/nearby
// @desc    Find nearby porting centers
// @access  Private
router.post('/centers/nearby', protect, findNearbyPortingCenters);

// @route   POST /api/porting/calculate-dates
// @desc    Calculate SMS date and porting date based on plan end date
// @access  Public
router.post('/calculate-dates', calculatePortingDates);

// @route   GET /api/porting/rules/:circleId
// @desc    Get porting rules for a specific circle
// @access  Public
router.get('/rules/:circleId', getPortingRules);

// @route   GET /api/porting/providers
// @desc    Get list of service providers
// @access  Public
router.get('/providers', getServiceProviders);

// @route   GET /api/porting/circles
// @desc    Get list of telecom circles
// @access  Public
router.get('/circles', getTelecomCircles);

// @route   PUT /api/porting/automation/:id
// @desc    Toggle automated porting for a specific porting request
// @access  Private
router.put('/automation/:id', protect, toggleAutomatedPorting);

module.exports = router; 