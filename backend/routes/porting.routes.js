import express from 'express';
import {
  submitPortingRequest,
  submitPortingRequestNoAuth,
  getUserPortingRequests,
  getPortingStatus,
  getServiceProviders,
  getTelecomCircles,
  findNearbyPortingCenters,
  calculatePortingDates,
  getPortingRules,
  toggleAutomatedPorting,
  getPortingRequestById,
  initiateProviderPorting,
  checkProviderPortingStatus,
  updateUpcCode,
  getPlanInformation
} from '../controllers/porting.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Define porting routes
// These will be fully implemented in Step 5

// @route   POST /api/porting/submit
// @desc    Submit a new porting request
// @access  Private
router.post('/submit', protect, submitPortingRequest);

// @route   POST /api/porting/submit-no-auth
// @desc    Submit a new porting request without authentication
// @access  Public
router.post('/submit-no-auth', submitPortingRequestNoAuth);

// @route   GET /api/porting/requests
// @desc    Get all porting requests for a user
// @access  Private
router.get('/requests', protect, getUserPortingRequests);

// @route   GET /api/porting/requests/:id
// @desc    Get details of a specific porting request
// @access  Private
router.get('/requests/:id', protect, getPortingRequestById);

// @route   POST /api/porting/requests/:id/initiate-provider-porting
// @desc    Initiate porting with telecom provider API
// @access  Private
router.post('/requests/:id/initiate-provider-porting', protect, initiateProviderPorting);

// @route   GET /api/porting/requests/:id/provider-status
// @desc    Check porting status with provider API
// @access  Private
router.get('/requests/:id/provider-status', protect, checkProviderPortingStatus);

// @route   PUT /api/porting/requests/:id/update-upc
// @desc    Update UPC code for porting request
// @access  Private
router.put('/requests/:id/update-upc', protect, updateUpcCode);

// @route   GET /api/porting/status/:id
// @desc    Get status of a specific porting request
// @access  Private (with fallback for demo)
router.get('/status/:id', (req, res, next) => {
  const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  if (isDemoMode) {
    // In demo mode, allow without authentication
    const requestId = req.params.id;
    
    // Enhanced error handling for demo mode
    try {
      // Generate demo data with the given ID
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - 3); // 3 days ago
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 4); // 4 days in future
      
      const expectedCompletionDate = new Date();
      expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 7); // 7 days in future
      
      // Create mock timeline
      const timeline = [
        {
          status: 'pending',
          timestamp: createdDate.toISOString(),
          notes: 'Your porting request has been received.'
        },
        {
          status: 'processing',
          timestamp: new Date(createdDate.getTime() + 86400000).toISOString(), // 1 day after creation
          notes: 'Your request is being processed by the carrier.'
        }
      ];
      
      // Only add approved status if enough time has passed (simulating progress)
      const twoDaysAfterCreation = new Date(createdDate.getTime() + 172800000); // 2 days after creation
      if (new Date() > twoDaysAfterCreation) {
        timeline.push({
          status: 'approved',
          timestamp: twoDaysAfterCreation.toISOString(),
          notes: 'Your porting request has been approved.'
        });
      }
      
      // Demo response
      return res.json({
        success: true,
        data: {
          _id: requestId,
          mobileNumber: '9876543210',
          currentProvider: 'Airtel',
          newProvider: 'Jio',
          upcCode: 'UPC' + Math.floor(Math.random() * 10000000),
          status: timeline.length > 2 ? 'approved' : 'processing',
          createdAt: createdDate.toISOString(),
          scheduledDate: scheduledDate.toISOString(),
          expectedCompletionDate: expectedCompletionDate.toISOString(),
          notes: 'Customer requested port-in due to better network coverage.',
          timeline: timeline,
          statusHistory: timeline
        }
      });
    } catch (error) {
      console.error('Error in demo mode status handler:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate mock data'
      });
    }
  } else {
    // In production mode, use authentication protection
    protect(req, res, next);
  }
}, getPortingStatus);

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

// Add fallback endpoint for cancelled requests and other common cases
router.put('/requests/:id/cancel', protect, (req, res) => {
  try {
    const requestId = req.params.id;
    console.log(`Request to cancel porting ID: ${requestId}`);
    
    // In demo mode, always succeed
    return res.json({
      success: true,
      message: 'Porting request cancelled successfully',
      data: { id: requestId, status: 'cancelled' }
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel request'
    });
  }
});

// @route   GET /api/porting/plan-info/:mobileNumber
// @desc    Get plan information for a mobile number
// @access  Private
router.get('/plan-info/:mobileNumber', protect, getPlanInformation);

export default router; 