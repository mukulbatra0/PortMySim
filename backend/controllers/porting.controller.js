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

    // Get user ID from req.user.id set by auth middleware
    const userId = req.user.id;
    
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
    // Get user ID from req.user.id set by auth middleware
    const userId = req.user.id;

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
    if (portingRequest.user.toString() !== req.user.id) {
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
    const { latitude, longitude, provider, address } = req.body;
    
    // Validate required fields
    if ((!latitude || !longitude) && !address) {
      return res.status(400).json({
        success: false,
        error: 'Please provide coordinates (latitude and longitude) or an address'
      });
    }
    
    let coords = { lat: latitude, lng: longitude };
    
    // If address is provided but no coordinates, geocode the address
    if (address && (!latitude || !longitude)) {
      coords = await geocodeAddress(address);
      
      if (!coords) {
        return res.status(400).json({
          success: false,
          error: 'Could not geocode the provided address'
        });
      }
    }
    
    // Get centers from the appropriate provider API if available, otherwise use fallback
    let centers = [];
    
    if (process.env.NODE_ENV === 'production') {
      try {
        // Try to get centers from the real API endpoints
        centers = await getPortingCentersFromProviders(provider, coords);
      } catch (apiError) {
        console.warn('Error fetching from real providers API:', apiError);
        // Fallback to mock data
        centers = getFallbackPortingCenters(provider, coords);
      }
    } else {
      // In development mode, use fallback centers
      centers = getFallbackPortingCenters(provider, coords);
    }
    
    // Calculate distance from the user's location
    centers.forEach((center) => {
      center.distance = calculateDistance(
        coords.lat,
        coords.lng,
        center.latitude,
        center.longitude
      );
    });
    
    // Sort centers by distance
    centers.sort((a, b) => a.distance - b.distance);
    
    return res.status(200).json({
      success: true,
      count: centers.length,
      data: centers
    });
  } catch (error) {
    console.error('Error finding nearby porting centers:', error);
    return res.status(500).json({
      success: false,
      error: 'Error finding porting centers: ' + error.message
    });
  }
};

/**
 * Helper function to geocode an address
 */
const geocodeAddress = async (address) => {
  try {
    // Check if we have a LocationIQ API key
    const locationIqApiKey = process.env.LOCATION_IQ_API_KEY;
    
    if (locationIqApiKey) {
      // Use LocationIQ geocoding service
      const encodedAddress = encodeURIComponent(address);
      const apiUrl = `https://eu1.locationiq.com/v1/search.php?key=${locationIqApiKey}&q=${encodedAddress}&format=json&limit=1`;
      
      const fetch = require('node-fetch');
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        }
      }
    }
    
    // If LocationIQ fails or is not configured, use Google Maps API if available
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (googleMapsApiKey) {
      const encodedAddress = encodeURIComponent(address);
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}`;
      
      const fetch = require('node-fetch');
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          return {
            lat: location.lat,
            lng: location.lng
          };
        }
      }
    }
    
    // If all geocoding services fail, use a fallback list of known locations
    const knownLocations = {
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'pune': { lat: 18.5204, lng: 73.8567 }
    };
    
    // Check if the address contains any of our known cities
    const addressLower = address.toLowerCase();
    for (const [city, coords] of Object.entries(knownLocations)) {
      if (addressLower.includes(city)) {
        return coords;
      }
    }
    
    // If nothing works, return null
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Helper function to get porting centers from provider APIs
 */
const getPortingCentersFromProviders = async (providerFilter, coordinates) => {
  try {
    const providers = ['airtel', 'jio', 'vi', 'bsnl'];
    let centers = [];
    
    // If a specific provider is requested, only query that one
    const providersToQuery = providerFilter && providerFilter !== 'any' 
      ? [providerFilter] 
      : providers;
    
    // Fetch centers from each provider's API
    await Promise.all(providersToQuery.map(async (provider) => {
      try {
        const providerCenters = await fetchProviderCenters(provider, coordinates);
        centers = [...centers, ...providerCenters];
      } catch (error) {
        console.warn(`Error fetching centers for ${provider}:`, error);
        // On error, get fallback centers for this provider
        const fallbackCenters = getFallbackPortingCenters(provider, coordinates)
          .filter(center => center.provider === provider);
        centers = [...centers, ...fallbackCenters];
      }
    }));
    
    return centers;
  } catch (error) {
    console.error('Error getting centers from providers:', error);
    throw error;
  }
};

/**
 * Helper function to fetch centers from a specific provider's API
 */
const fetchProviderCenters = async (provider, coordinates) => {
  // Get provider-specific API configuration
  const providerApis = {
    'airtel': {
      endpoint: process.env.AIRTEL_CENTERS_API_URL || 'https://api.airtel.in/centers/v1/nearby',
      apiKey: process.env.AIRTEL_API_KEY,
      apiSecret: process.env.AIRTEL_API_SECRET
    },
    'jio': {
      endpoint: process.env.JIO_CENTERS_API_URL || 'https://api.jio.com/centers/v1/locate',
      apiKey: process.env.JIO_API_KEY,
      apiSecret: process.env.JIO_API_SECRET
    },
    'vi': {
      endpoint: process.env.VI_CENTERS_API_URL || 'https://api.vodafoneidea.com/centers/v1/search',
      apiKey: process.env.VI_API_KEY,
      apiSecret: process.env.VI_API_SECRET
    },
    'bsnl': {
      endpoint: process.env.BSNL_CENTERS_API_URL || 'https://api.bsnl.co.in/centers/v1/find',
      apiKey: process.env.BSNL_API_KEY,
      apiSecret: process.env.BSNL_API_SECRET
    }
  };
  
  const config = providerApis[provider];
  
  if (!config) {
    throw new Error(`No API configuration found for provider: ${provider}`);
  }
  
  // Prepare API call
  const payload = {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    radius: 10 // 10 km radius
  };
  
  // Generate auth headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    'X-API-Secret': config.apiSecret
  };
  
  try {
    // Make API call
    const fetch = require('node-fetch');
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      timeout: 10000 // 10 seconds timeout
    });
    
    if (!response.ok) {
      throw new Error(`Provider API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map provider-specific response to our standardized format
    return data.centers.map(center => ({
      id: center.id || `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      name: center.name,
      provider: provider,
      address: center.address,
      latitude: center.latitude || center.lat,
      longitude: center.longitude || center.lng,
      isOpen: center.isOpen || true,
      hours: center.hours || ['Mon-Sat: 9:00 AM - 8:00 PM', 'Sun: 10:00 AM - 6:00 PM'],
      rating: center.rating || (3.5 + Math.random() * 1.5),
      ratingCount: center.ratingCount || Math.floor(50 + Math.random() * 200),
      website: center.website || `https://www.${provider}.com`
    }));
  } catch (error) {
    console.error(`Error fetching centers from ${provider} API:`, error);
    throw error;
  }
};

/**
 * Helper function to get fallback porting centers
 */
const getFallbackPortingCenters = (providerFilter, coordinates) => {
  // Define fallback centers with proper structure
  const fallbackCenters = [
    {
      id: "fallback_airtel_1",
      name: "Airtel Store",
      provider: "airtel",
      address: "123 Main Street, New Delhi, 110001",
      latitude: 28.6139, 
      longitude: 77.2090,
      isOpen: true,
      hours: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sun: 10:00 AM - 6:00 PM"],
      rating: 4.3,
      ratingCount: 124,
      distance: 2.5,
      website: "https://www.airtel.in"
    },
    {
      id: "fallback_jio_1",
      name: "Jio Store",
      provider: "jio",
      address: "456 Market Road, New Delhi, 110002",
      latitude: 28.6219, 
      longitude: 77.2100,
      isOpen: true,
      hours: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sun: 10:00 AM - 6:00 PM"],
      rating: 4.5,
      ratingCount: 156,
      distance: 3.8,
      website: "https://www.jio.com"
    },
    {
      id: "fallback_vi_1",
      name: "Vi Store",
      provider: "vi",
      address: "789 Tower Lane, New Delhi, 110003",
      latitude: 28.6129, 
      longitude: 77.2270,
      isOpen: true,
      hours: ["Mon-Sat: 9:30 AM - 7:30 PM", "Sun: 11:00 AM - 5:00 PM"],
      rating: 4.1,
      ratingCount: 98,
      distance: 4.2,
      website: "https://www.myvi.in"
    },
    {
      id: "fallback_bsnl_1",
      name: "BSNL Customer Care",
      provider: "bsnl",
      address: "101 Government Complex, New Delhi, 110004",
      latitude: 28.6280, 
      longitude: 77.2310,
      isOpen: true,
      hours: ["Mon-Fri: 10:00 AM - 6:00 PM", "Sat: 10:00 AM - 2:00 PM", "Sun: Closed"],
      rating: 3.8,
      ratingCount: 72,
      distance: 5.1,
      website: "https://www.bsnl.in"
    },
    {
      id: "fallback_airtel_2",
      name: "Airtel Express",
      provider: "airtel",
      address: "202 Mall Road, Mumbai, 400001",
      latitude: 19.0720, 
      longitude: 72.8570,
      isOpen: true,
      hours: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sun: 10:00 AM - 6:00 PM"],
      rating: 4.0,
      ratingCount: 87,
      distance: 6.3,
      website: "https://www.airtel.in"
    },
    {
      id: "fallback_jio_2",
      name: "Jio Digital Center",
      provider: "jio",
      address: "303 Tech Park, Bangalore, 560001",
      latitude: 12.9716, 
      longitude: 77.5946,
      isOpen: true,
      hours: ["Mon-Sat: 9:00 AM - 8:00 PM", "Sun: 10:00 AM - 6:00 PM"],
      rating: 4.7,
      ratingCount: 203,
      distance: 7.8,
      website: "https://www.jio.com"
    },
    {
      id: "fallback_vi_2",
      name: "Vi Flagship Store",
      provider: "vi",
      address: "404 Station Road, Chennai, 600001",
      latitude: 13.0827, 
      longitude: 80.2707,
      isOpen: true,
      hours: ["Mon-Sat: 9:30 AM - 7:30 PM", "Sun: 11:00 AM - 5:00 PM"],
      rating: 4.2,
      ratingCount: 112,
      distance: 8.5,
      website: "https://www.myvi.in"
    },
    {
      id: "fallback_bsnl_2",
      name: "BSNL Service Center",
      provider: "bsnl",
      address: "505 Government Road, Kolkata, 700001",
      latitude: 22.5726, 
      longitude: 88.3639,
      isOpen: true,
      hours: ["Mon-Fri: 10:00 AM - 6:00 PM", "Sat: 10:00 AM - 2:00 PM", "Sun: Closed"],
      rating: 3.9,
      ratingCount: 65,
      distance: 9.2,
      website: "https://www.bsnl.in"
    }
  ];
  
  // Filter by provider if specified
  const filteredCenters = providerFilter && providerFilter !== 'any'
    ? fallbackCenters.filter(center => center.provider === providerFilter)
    : fallbackCenters;
  
  return filteredCenters;
};

/**
 * Helper function to calculate distance between two coordinates in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Helper function to convert degrees to radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
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
    if (portingRequest.user.toString() !== req.user.id) {
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

/**
 * @desc    Get details of a specific porting request
 * @route   GET /api/porting/requests/:id
 * @access  Private
 */
const getPortingRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID format'
      });
    }
    
    // Find the porting request
    const portingRequest = await PortingRequest.findById(requestId);
    
    // Check if request exists
    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Porting request not found'
      });
    }
    
    // Check if the request belongs to the authenticated user
    if (portingRequest.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this porting request'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: portingRequest
    });
  } catch (error) {
    console.error('Error fetching porting request details:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + (error.message || 'Unknown error occurred')
    });
  }
};

// Helper function to get telecom circle info
const getTelecomCircleInfo = (circleId) => {
  // In a real app, you would fetch this from a database
  const circleInfo = {
    'andhra-pradesh': 'Andhra Pradesh & Telangana',
    'assam': 'Assam',
    'bihar': 'Bihar & Jharkhand',
    'delhi': 'Delhi NCR',
    'gujarat': 'Gujarat',
    'haryana': 'Haryana',
    'himachal': 'Himachal Pradesh',
    'jammu': 'Jammu & Kashmir',
    'karnataka': 'Karnataka',
    'kerala': 'Kerala',
    'kolkata': 'Kolkata',
    'maharashtra': 'Maharashtra & Goa',
    'madhya-pradesh': 'Madhya Pradesh & Chhattisgarh',
    'mumbai': 'Mumbai',
    'northeast': 'North East',
    'orissa': 'Orissa',
    'punjab': 'Punjab',
    'rajasthan': 'Rajasthan',
    'tamil-nadu': 'Tamil Nadu',
    'up-east': 'UP East',
    'up-west': 'UP West',
    'west-bengal': 'West Bengal'
  };

  return circleInfo[circleId] || circleId;
};

/**
 * @desc    Initiate porting with telecom provider API
 * @route   POST /api/porting/requests/:id/initiate-provider-porting
 * @access  Private
 */
const initiateProviderPorting = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID format'
      });
    }
    
    // Find the porting request
    const portingRequest = await PortingRequest.findById(requestId);
    
    // Check if request exists
    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Porting request not found'
      });
    }
    
    // Check if the request belongs to the authenticated user or user is admin
    if (portingRequest.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this porting request'
      });
    }
    
    // Check if request is in valid state for provider initiation
    if (portingRequest.status !== 'pending' && portingRequest.status !== 'processing') {
      return res.status(400).json({
        success: false,
        error: `Cannot initiate porting with provider for request in '${portingRequest.status}' status`
      });
    }
    
    // Check if UPC code is available
    if (!portingRequest.upc && !req.body.upc) {
      return res.status(400).json({
        success: false,
        error: 'UPC code required to initiate porting with provider'
      });
    }
    
    // Update UPC code if provided
    if (req.body.upc && !portingRequest.upc) {
      portingRequest.upc = req.body.upc;
      await portingRequest.save();
    }
    
    // Call the initiateProviderPorting method we added to the model
    const result = await portingRequest.initiateProviderPorting();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to initiate porting with provider'
      });
    }
    
    // If successful, update the status to processing
    if (portingRequest.status === 'pending') {
      await portingRequest.updateStatus('processing', 'Porting initiated with provider');
    }
    
    return res.status(200).json({
      success: true,
      message: 'Porting request successfully initiated with provider',
      data: {
        referenceId: result.referenceId,
        estimatedCompletionTime: result.estimatedCompletionTime,
        currentStatus: portingRequest.status
      }
    });
  } catch (error) {
    console.error('Error initiating provider porting:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + (error.message || 'Unknown error occurred')
    });
  }
};

/**
 * @desc    Check porting status with provider API
 * @route   GET /api/porting/requests/:id/provider-status
 * @access  Private
 */
const checkProviderPortingStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Validate if the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID format'
      });
    }
    
    // Find the porting request
    const portingRequest = await PortingRequest.findById(requestId);
    
    // Check if request exists
    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Porting request not found'
      });
    }
    
    // Check if the request belongs to the authenticated user or user is admin
    if (portingRequest.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this porting request'
      });
    }
    
    // Call the checkProviderPortingStatus method we added to the model
    const result = await portingRequest.checkProviderPortingStatus();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to check porting status with provider'
      });
    }
    
    // Update porting request status based on provider status if needed
    const providerStatus = result.providerStatus;
    let systemStatus = portingRequest.status;
    
    if (providerStatus === 'COMPLETED' && systemStatus !== 'completed') {
      await portingRequest.updateStatus('completed', 'Porting completed by provider');
      systemStatus = 'completed';
    } else if (providerStatus === 'APPROVED' && systemStatus !== 'approved' && systemStatus !== 'completed') {
      await portingRequest.updateStatus('approved', 'Porting approved by provider');
      systemStatus = 'approved';
    }
    
    return res.status(200).json({
      success: true,
      data: {
        requestStatus: systemStatus,
        providerStatus: result.providerStatus,
        details: result.details,
        lastUpdated: result.lastUpdated,
        referenceId: result.referenceId
      }
    });
  } catch (error) {
    console.error('Error checking provider porting status:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + (error.message || 'Unknown error occurred')
    });
  }
};

/**
 * @desc    Update UPC code for porting request
 * @route   PUT /api/porting/requests/:id/update-upc
 * @access  Private
 */
const updateUpcCode = async (req, res) => {
  try {
    const { upc } = req.body;
    const requestId = req.params.id;
    
    // Validate required fields
    if (!upc) {
      return res.status(400).json({
        success: false,
        error: 'Please provide UPC code'
      });
    }
    
    // Validate UPC format
    if (!/^\d{8}$/.test(upc)) {
      return res.status(400).json({
        success: false,
        error: 'UPC code must be 8 digits'
      });
    }
    
    // Find the porting request
    const portingRequest = await PortingRequest.findById(requestId);
    
    // Check if request exists
    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Porting request not found'
      });
    }
    
    // Check if the request belongs to the authenticated user or user is admin
    if (portingRequest.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this porting request'
      });
    }
    
    // Update UPC code
    portingRequest.upc = upc;
    
    // Add note to status history
    portingRequest.statusHistory.push({
      status: portingRequest.status,
      timestamp: Date.now(),
      notes: 'UPC code updated'
    });
    
    await portingRequest.save();
    
    return res.status(200).json({
      success: true,
      message: 'UPC code updated successfully',
      data: {
        id: portingRequest._id,
        upc: portingRequest.upc,
        status: portingRequest.status
      }
    });
  } catch (error) {
    console.error('Error updating UPC code:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + (error.message || 'Unknown error occurred')
    });
  }
};

/**
 * @desc    Get plan information for a mobile number
 * @route   GET /api/porting/plan-info/:mobileNumber
 * @access  Private
 */
const getPlanInformation = async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    
    // Validate mobile number format
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mobile number format. Please provide a 10-digit number.'
      });
    }
    
    // Check if there's an existing porting request for this number
    let portingRequest = await PortingRequest.findOne({ mobileNumber });
    
    // If no existing request, create a temporary one to use the API method
    if (!portingRequest) {
      // Try to infer provider from mobile number series
      const provider = inferProviderFromNumber(mobileNumber);
      
      portingRequest = new PortingRequest({
        mobileNumber,
        currentProvider: provider,
        user: req.user.id
      });
    }
    
    // Get plan information using the model method
    const planInfo = await portingRequest.getPlanInformation();
    
    if (!planInfo.success) {
      return res.status(400).json({
        success: false,
        error: planInfo.error || 'Failed to retrieve plan information'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: planInfo
    });
  } catch (error) {
    console.error('Error fetching plan information:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + (error.message || 'Unknown error occurred')
    });
  }
};

/**
 * Helper function to infer provider from mobile number
 */
const inferProviderFromNumber = (mobileNumber) => {
  // This is a simplified implementation
  // In a real-world scenario, you would have a comprehensive database of number series
  const firstFourDigits = mobileNumber.substring(0, 4);
  
  // Some example number series (illustrative only, not comprehensive)
  const providerPrefixes = {
    'airtel': ['9891', '9899', '9717', '8800', '9810'],
    'jio': ['9321', '8980', '7021', '7016', '7977'],
    'vi': ['9821', '9833', '9987', '8451', '9004'],
    'bsnl': ['9412', '9424', '9425', '9427', '9403']
  };
  
  for (const [provider, prefixes] of Object.entries(providerPrefixes)) {
    if (prefixes.some(prefix => mobileNumber.startsWith(prefix))) {
      return provider;
    }
  }
  
  // Return a default if unable to determine
  return 'unknown';
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
  toggleAutomatedPorting,
  getPortingRequestById,
  initiateProviderPorting,
  checkProviderPortingStatus,
  updateUpcCode,
  getPlanInformation
}; 