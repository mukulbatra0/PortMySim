const PortingRequest = require('../models/PortingRequest.model');
const PortingRules = require('../models/PortingRules.model');
const PortingCenter = require('../models/PortingCenter.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const portingCenterService = require('../utils/portingCenterService');

/**
 * @desc    Submit a new porting request
 * @route   POST /api/porting/submit
 * @access  Private
 */
exports.submitPortingRequest = async (req, res) => {
  try {
    const {
      mobileNumber,
      currentProvider,
      currentCircle,
      newProvider,
      scheduledDate,
      timeSlot,
      fullName,
      email,
      alternateNumber,
      planEndDate,
      location
    } = req.body;

    // Get user ID from req.userId set by auth middleware
    const userId = req.userId;

    // Calculate SMS date based on plan end date and circle rules
    const smsDate = await PortingRules.calculateSmsDate(planEndDate, currentCircle);

    // Find nearby porting centers if location is provided
    let portingCenterDetails = null;
    if (location && location.lat && location.lng) {
      const nearbyCenters = await portingCenterService.findNearbyPortingCenters(
        location.lat,
        location.lng,
        newProvider,
        10 // 10km radius
      );
      
      if (nearbyCenters && nearbyCenters.length > 0) {
        const center = nearbyCenters[0];
        portingCenterDetails = {
          name: center.name,
          address: center.address.formattedAddress,
          location: center.location,
          openingHours: center.openingHours
        };
      }
    }

    // Create a new porting request
    const portingRequest = new PortingRequest({
      user: userId,
      mobileNumber,
      currentProvider,
      currentCircle,
      newProvider,
      planEndDate: new Date(planEndDate),
      scheduledDate: new Date(scheduledDate),
      smsDate: smsDate,
      portingCenterDetails,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: Date.now(),
          notes: 'Porting request submitted'
        }
      ],
      metadata: {
        timeSlot,
        fullName,
        email,
        alternateNumber
      }
    });

    // Generate notifications for the porting process
    await portingRequest.scheduleNotifications();

    // Save the porting request
    await portingRequest.save();

    // Generate reference number
    const refNumber = `PORT-${portingRequest._id.toString().slice(-8)}`;

    return res.status(201).json({
      success: true,
      data: {
        id: portingRequest._id,
        refNumber,
        status: portingRequest.status,
        smsDate: portingRequest.smsDate,
        portingCenterDetails: portingRequest.portingCenterDetails,
        notifications: portingRequest.notifications.map(n => ({
          type: n.type,
          scheduledFor: n.scheduledFor,
          message: n.message
        }))
      },
      message: 'Porting request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting porting request:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get all porting requests for a user
 * @route   GET /api/porting/requests
 * @access  Private
 */
exports.getUserPortingRequests = async (req, res) => {
  try {
    // Get user ID from req.userId set by auth middleware
    const userId = req.userId;

    const portingRequests = await PortingRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('mobileNumber currentProvider newProvider scheduledDate smsDate status createdAt portingCenterDetails');

    return res.status(200).json({
      success: true,
      count: portingRequests.length,
      data: portingRequests
    });
  } catch (error) {
    console.error('Error getting user porting requests:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get status of a specific porting request
 * @route   GET /api/porting/status/:id
 * @access  Private
 */
exports.getPortingStatus = async (req, res) => {
  try {
    const portingRequest = await PortingRequest.findById(req.params.id)
      .select('mobileNumber currentProvider newProvider scheduledDate smsDate status statusHistory createdAt portingCenterDetails notifications');

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check if the user owns this porting request
    if (portingRequest.user.toString() !== req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this porting request'
      });
    }

    // Filter notifications to show only future ones that haven't been sent
    const pendingNotifications = portingRequest.notifications
      .filter(n => !n.sent && n.scheduledFor > new Date())
      .map(n => ({
        type: n.type,
        scheduledFor: n.scheduledFor,
        message: n.message
      }));

    const response = {
      ...portingRequest._doc,
      notifications: pendingNotifications
    };

    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error getting porting status:', error);
    
    // Check if ID is invalid
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Find nearby porting centers
 * @route   POST /api/porting/centers/nearby
 * @access  Private
 */
exports.findNearbyPortingCenters = async (req, res) => {
  try {
    const { lat, lng, provider, radius = 10 } = req.body;

    if (!lat || !lng || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Please provide latitude, longitude, and provider'
      });
    }

    const centers = await portingCenterService.findNearbyPortingCenters(
      parseFloat(lat),
      parseFloat(lng),
      provider,
      parseFloat(radius)
    );

    return res.status(200).json({
      success: true,
      count: centers.length,
      data: centers
    });
  } catch (error) {
    console.error('Error finding nearby centers:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Calculate SMS and porting dates
 * @route   POST /api/porting/calculate-dates
 * @access  Public
 */
exports.calculatePortingDates = async (req, res) => {
  try {
    const { planEndDate, circleId } = req.body;

    if (!planEndDate || !circleId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide plan end date and circle ID'
      });
    }

    // Calculate SMS date based on plan end date
    const smsDate = await PortingRules.calculateSmsDate(new Date(planEndDate), circleId);
    
    // Calculate porting date based on SMS date
    const portingDate = await PortingRules.calculatePortingDate(smsDate, circleId);

    return res.status(200).json({
      success: true,
      data: {
        planEndDate: new Date(planEndDate),
        smsDate,
        portingDate
      }
    });
  } catch (error) {
    console.error('Error calculating porting dates:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

/**
 * @desc    Get porting rules for a specific circle
 * @route   GET /api/porting/rules/:circleId
 * @access  Public
 */
exports.getPortingRules = async (req, res) => {
  try {
    const rules = await PortingRules.findOne({ 
      circle: req.params.circleId,
      active: true
    });

    if (!rules) {
      return res.status(404).json({
        success: false,
        error: 'No porting rules found for this circle'
      });
    }

    return res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Error getting porting rules:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get list of service providers
 * @route   GET /api/porting/providers
 * @access  Public
 */
exports.getServiceProviders = async (req, res) => {
  try {
    // In a real app, you would fetch this from a database
    const providers = [
      { id: 'airtel', name: 'Airtel', description: 'Bharti Airtel Limited' },
      { id: 'jio', name: 'Jio', description: 'Reliance Jio Infocomm Limited' },
      { id: 'vi', name: 'Vi', description: 'Vodafone Idea Limited' },
      { id: 'bsnl', name: 'BSNL', description: 'Bharat Sanchar Nigam Limited' },
      { id: 'mtnl', name: 'MTNL', description: 'Mahanagar Telephone Nigam Limited' }
    ];

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error('Error getting service providers:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get list of telecom circles
 * @route   GET /api/porting/circles
 * @access  Public
 */
exports.getTelecomCircles = async (req, res) => {
  try {
    // In a real app, you would fetch this from a database
    const circles = [
      { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
      { id: 'assam', name: 'Assam' },
      { id: 'bihar', name: 'Bihar & Jharkhand' },
      { id: 'delhi', name: 'Delhi NCR' },
      { id: 'gujarat', name: 'Gujarat' },
      { id: 'haryana', name: 'Haryana' },
      { id: 'himachal', name: 'Himachal Pradesh' },
      { id: 'jammu', name: 'Jammu & Kashmir' },
      { id: 'karnataka', name: 'Karnataka' },
      { id: 'kerala', name: 'Kerala' },
      { id: 'kolkata', name: 'Kolkata' },
      { id: 'maharashtra', name: 'Maharashtra & Goa' },
      { id: 'madhya-pradesh', name: 'Madhya Pradesh & Chhattisgarh' },
      { id: 'mumbai', name: 'Mumbai' },
      { id: 'northeast', name: 'North East' },
      { id: 'orissa', name: 'Orissa' },
      { id: 'punjab', name: 'Punjab' },
      { id: 'rajasthan', name: 'Rajasthan' },
      { id: 'tamil-nadu', name: 'Tamil Nadu' },
      { id: 'up-east', name: 'UP East' },
      { id: 'up-west', name: 'UP West' },
      { id: 'west-bengal', name: 'West Bengal' }
    ];

    return res.status(200).json({
      success: true,
      count: circles.length,
      data: circles
    });
  } catch (error) {
    console.error('Error getting telecom circles:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Toggle automated porting with SMS handling
 * @route   PUT /api/porting/automation/:id
 * @access  Private
 */
exports.toggleAutomatedPorting = async (req, res) => {
  try {
    const { automatePorting } = req.body;
    
    if (typeof automatePorting !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'automatePorting must be a boolean value'
      });
    }

    const portingRequest = await PortingRequest.findById(req.params.id);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check if the user owns this porting request
    if (portingRequest.user.toString() !== req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to modify this porting request'
      });
    }

    // Update the automation settings
    portingRequest.automatePorting = automatePorting;
    
    // If enabling automation, schedule the automated SMS
    if (automatePorting) {
      // Add a special notification for mobile app to send SMS
      portingRequest.notifications.push({
        type: 'mobile_sms',
        scheduledFor: portingRequest.smsDate,
        message: `PORT`,
        sent: false,
        automatedSms: true,
        targetNumber: '1900'
      });
      
      // Add status notification for when automation is enabled
      portingRequest.statusHistory.push({
        status: portingRequest.status,
        timestamp: Date.now(),
        notes: 'Automated porting process enabled'
      });
    } else {
      // If disabling automation, remove any unsent automated SMS notifications
      portingRequest.notifications = portingRequest.notifications.filter(n => 
        !(n.automatedSms === true && !n.sent)
      );
      
      // Add status notification for when automation is disabled
      portingRequest.statusHistory.push({
        status: portingRequest.status,
        timestamp: Date.now(),
        notes: 'Automated porting process disabled'
      });
    }

    await portingRequest.save();

    return res.status(200).json({
      success: true,
      data: {
        automatePorting: portingRequest.automatePorting,
        mobileNumber: portingRequest.mobileNumber,
        smsDate: portingRequest.smsDate
      },
      message: automatePorting 
        ? 'Automated porting process enabled' 
        : 'Automated porting process disabled'
    });
  } catch (error) {
    console.error('Error toggling automated porting:', error);
    
    // Check if ID is invalid
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 