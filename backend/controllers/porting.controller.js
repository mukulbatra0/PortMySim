import PortingRequest from '../models/PortingRequest.model.js';
import PortingRules from '../models/PortingRules.model.js';
import PortingCenter from '../models/PortingCenter.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';
import * as portingCenterService from '../utils/portingCenterService.js';

/**
 * @desc    Submit a new porting request without authentication
 * @route   POST /api/porting/submit-no-auth
 * @access  Public
 */
const submitPortingRequestNoAuth = async (req, res) => {
  try {
    console.log('[API] Received porting request submission (no auth)');
    
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
      location,
      automatePorting,
      notifyUpdates
    } = req.body;

    // Validate required fields with detailed feedback
    const missingFields = [];
    if (!mobileNumber) missingFields.push('mobileNumber');
    if (!currentProvider) missingFields.push('currentProvider');
    if (!currentCircle) missingFields.push('currentCircle');
    if (!newProvider) missingFields.push('newProvider');
    if (!scheduledDate) missingFields.push('scheduledDate');
    if (!planEndDate) missingFields.push('planEndDate');
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Please provide all required fields: ${missingFields.join(', ')}`
      });
    }

    // Find or create a guest user for this request
    let userId;
    try {
      // Look for existing user with this email
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        userId = existingUser._id;
        console.log(`Found existing user with email ${email}, ID: ${userId}`);
      } else {
        // Create a new guest user
        const newUser = new User({
          name: fullName,
          email: email,
          password: Math.random().toString(36).slice(-10) + Date.now().toString(36), // Random password
          role: 'guest',
          isVerified: false
        });
        
        await newUser.save();
        userId = newUser._id;
        console.log(`Created new guest user with email ${email}, ID: ${userId}`);
      }
    } catch (userError) {
      console.error('Error finding or creating user:', userError);
      // Create a default guest user ID if user creation fails
      userId = new mongoose.Types.ObjectId();
      console.log(`Using temporary user ID: ${userId}`);
    }
    
    // Log the request details for debugging
    console.log('Processing porting request for:', {
      currentCircle,
      mobileNumber: mobileNumber.slice(-4), // Log last 4 digits for privacy
      userId,
      timeSlot
    });

    try {
      // Calculate SMS date based on plan end date and circle rules
      const smsDate = await PortingRules.calculateSmsDate(planEndDate, currentCircle);
      console.log(`Calculated SMS date: ${smsDate} for plan end date: ${planEndDate}`);
      
      // Find nearby porting centers if location is provided
      let portingCenterDetails = null;
      if (location && location.lat && location.lng) {
        console.log(`Finding porting centers near: ${location.lat}, ${location.lng}`);
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
          console.log(`Found porting center: ${center.name}`);
        } else {
          console.log('No nearby porting centers found, using default center');
          // Use default center if none found
          portingCenterDetails = {
            name: "Default Service Center",
            address: "Please contact customer service for nearest center",
            location: {
              type: "Point",
              coordinates: [0, 0]
            }
          };
        }
      }

      // Parse boolean values
      const isAutomatedPorting = automatePorting === true || automatePorting === 'true';
      const shouldNotifyUpdates = notifyUpdates === true || notifyUpdates === 'true';
      
      // Create a new porting request
      console.log('Creating new porting request document');
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
        automatePorting: isAutomatedPorting,
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: Date.now(),
            notes: 'Porting request submitted (no auth)'
          }
        ],
        metadata: {
          timeSlot: timeSlot || 'morning',
          fullName,
          email,
          alternateNumber: alternateNumber || '',
          notifyUpdates: shouldNotifyUpdates
        }
      });

      // Generate notifications for the porting process
      console.log('Scheduling notifications');
      await portingRequest.scheduleNotifications();

      // Save the porting request with error handling
      try {
        console.log('Saving porting request to database');
        await portingRequest.save();
        console.log(`Porting request saved successfully with ID: ${portingRequest._id}`);
      } catch (saveError) {
        console.error('Error saving porting request to database:', saveError);
        // Try to identify specific MongoDB errors
        if (saveError.name === 'MongoServerError') {
          if (saveError.code === 11000) {
            return res.status(400).json({
              success: false,
              error: 'A porting request for this mobile number already exists'
            });
          }
        }
        throw saveError; // Re-throw to be caught by outer catch
      }

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
    } catch (specificError) {
      // Handle specific errors more gracefully
      console.error('Specific error in porting request:', specificError);
      
      if (specificError.message && specificError.message.includes('No porting rules found for circle')) {
        return res.status(400).json({
          success: false,
          error: `The telecom circle "${currentCircle}" is not recognized. Please select a valid circle.`
        });
      }
      
      throw specificError; // Pass to outer catch block if not handled specifically
    }
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
      error: 'Server Error: ' + (error.message || 'Unknown error occurred')
    });
  }
};

/**
 * @desc    Submit a new porting request
 * @route   POST /api/porting/submit
 * @access  Private
 */
const submitPortingRequest = async (req, res) => {
  try {
    console.log('[API] Received porting request submission');
    
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
      location,
      automatePorting,
      notifyUpdates
    } = req.body;

    // Validate required fields with detailed feedback
    const missingFields = [];
    if (!mobileNumber) missingFields.push('mobileNumber');
    if (!currentProvider) missingFields.push('currentProvider');
    if (!currentCircle) missingFields.push('currentCircle');
    if (!newProvider) missingFields.push('newProvider');
    if (!scheduledDate) missingFields.push('scheduledDate');
    if (!planEndDate) missingFields.push('planEndDate');
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Please provide all required fields: ${missingFields.join(', ')}`
      });
    }

    // Get user ID from req.userId set by auth middleware
    const userId = req.userId;
    
    // Log the request details for debugging
    console.log('Processing porting request for:', {
      currentCircle,
      mobileNumber: mobileNumber.slice(-4), // Log last 4 digits for privacy
      userId,
      timeSlot
    });

    try {
      // Calculate SMS date based on plan end date and circle rules
      const smsDate = await PortingRules.calculateSmsDate(planEndDate, currentCircle);
      console.log(`Calculated SMS date: ${smsDate} for plan end date: ${planEndDate}`);
      
      // Find nearby porting centers if location is provided
      let portingCenterDetails = null;
      if (location && location.lat && location.lng) {
        console.log(`Finding porting centers near: ${location.lat}, ${location.lng}`);
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
          console.log(`Found porting center: ${center.name}`);
        } else {
          console.log('No nearby porting centers found, using default center');
          // Use default center if none found
          portingCenterDetails = {
            name: "Default Service Center",
            address: "Please contact customer service for nearest center",
            location: {
              type: "Point",
              coordinates: [0, 0]
            }
          };
        }
      }

      // Parse boolean values
      const isAutomatedPorting = automatePorting === true || automatePorting === 'true';
      const shouldNotifyUpdates = notifyUpdates === true || notifyUpdates === 'true';
      
      // Create a new porting request
      console.log('Creating new porting request document');
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
        automatePorting: isAutomatedPorting,
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: Date.now(),
            notes: 'Porting request submitted'
          }
        ],
        metadata: {
          timeSlot: timeSlot || 'morning',
          fullName,
          email,
          alternateNumber: alternateNumber || '',
          notifyUpdates: shouldNotifyUpdates
        }
      });

      // Generate notifications for the porting process
      console.log('Scheduling notifications');
      await portingRequest.scheduleNotifications();

      // Save the porting request with error handling
      try {
        console.log('Saving porting request to database');
        await portingRequest.save();
        console.log(`Porting request saved successfully with ID: ${portingRequest._id}`);
      } catch (saveError) {
        console.error('Error saving porting request to database:', saveError);
        // Try to identify specific MongoDB errors
        if (saveError.name === 'MongoServerError') {
          if (saveError.code === 11000) {
            return res.status(400).json({
              success: false,
              error: 'A porting request for this mobile number already exists'
            });
          }
        }
        throw saveError; // Re-throw to be caught by outer catch
      }

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
    } catch (specificError) {
      // Handle specific errors more gracefully
      console.error('Specific error in porting request:', specificError);
      
      if (specificError.message && specificError.message.includes('No porting rules found for circle')) {
        return res.status(400).json({
          success: false,
          error: `The telecom circle "${currentCircle}" is not recognized. Please select a valid circle.`
        });
      }
      
      throw specificError; // Pass to outer catch block if not handled specifically
    }
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
      error: 'Server Error: ' + (error.message || 'Unknown error occurred')
    });
  }
};

/**
 * @desc    Get all porting requests for a user
 * @route   GET /api/porting/requests
 * @access  Private
 */
const getUserPortingRequests = async (req, res) => {
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
const getPortingStatus = async (req, res) => {
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
const findNearbyPortingCenters = async (req, res) => {
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
const calculatePortingDates = async (req, res) => {
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
const getPortingRules = async (req, res) => {
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
const getServiceProviders = async (req, res) => {
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
const getTelecomCircles = async (req, res) => {
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
const toggleAutomatedPorting = async (req, res) => {
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

export {
  submitPortingRequest,
  submitPortingRequestNoAuth,
  getUserPortingRequests,
  getPortingStatus,
  findNearbyPortingCenters,
  calculatePortingDates,
  getPortingRules,
  getServiceProviders,
  getTelecomCircles,
  toggleAutomatedPorting
}; 