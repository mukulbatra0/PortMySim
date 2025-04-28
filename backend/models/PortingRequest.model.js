import mongoose from 'mongoose';

// Porting Request Schema
const portingRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mobileNumber: {
      type: String,
      required: [true, 'Please add a mobile number'],
      match: [
        /^[6-9]\d{9}$/,
        'Please add a valid 10-digit mobile number'
      ]
    },
    trackingId: {
      type: String,
      unique: true,
      default: () => `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    },
    currentProvider: {
      type: String,
      required: [true, 'Please add current service provider']
    },
    currentCircle: {
      type: String,
      required: [true, 'Please add current circle']
    },
    newProvider: {
      type: String,
      required: [true, 'Please add new service provider']
    },
    planSelected: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    },
    planEndDate: {
      type: Date,
      required: [true, 'Please add current plan end date']
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please add scheduled porting date']
    },
    smsDate: {
      type: Date,
      required: [true, 'Please add date to send SMS to 1900']
    },
    automatePorting: {
      type: Boolean,
      default: false
    },
    portingCenterDetails: {
      name: String,
      address: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          default: [0, 0]
        }
      },
      openingHours: String
    },
    notifications: [{
      type: {
        type: String,
        enum: ['sms', 'email', 'app', 'mobile_sms'],
        required: true
      },
      scheduledFor: {
        type: Date,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      automatedSms: {
        type: Boolean,
        default: false
      },
      targetNumber: String
    }],
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    upc: {
      type: String,
      match: [/^\d{8}$/, 'UPC must be 8 digits']
    },
    documents: {
      idProof: {
        type: String
      },
      addressProof: {
        type: String
      }
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'processing', 'approved', 'rejected', 'completed']
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        notes: {
          type: String
        }
      }
    ],
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: {
      type: String
    },
    uniquePortingCode: {
      type: String,
      unique: true
    },
    metadata: {
      timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        required: true
      },
      fullName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      alternateNumber: {
        type: String,
        match: [
          /^[6-9]\d{9}$/,
          'Please add a valid 10-digit mobile number'
        ]
      }
    }
  },
  {
    timestamps: true
  }
);

// Index location for geospatial queries
portingRequestSchema.index({ "portingCenterDetails.location": "2dsphere" });

// Pre-save hook to generate a unique porting code if not provided
portingRequestSchema.pre('save', function(next) {
  // Only generate a code if one isn't already set
  if (!this.uniquePortingCode) {
    // Generate a unique code based on timestamp and random value
    this.uniquePortingCode = `PORT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  }
  next();
});

// Add status change method (will be fully implemented in Step 5)
portingRequestSchema.methods.updateStatus = function (newStatus, notes) {
  // We'll implement this in Step 5
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: Date.now(),
    notes: notes || `Status changed to ${newStatus}`
  });
  return this.save();
};

// Provider API Integration methods
// Method to initiate porting with telecom provider API
portingRequestSchema.methods.initiateProviderPorting = async function() {
  try {
    // Get provider-specific API configuration
    const providerConfig = await this.getProviderApiConfig(this.newProvider);
    
    if (!providerConfig) {
      console.error(`No API configuration found for provider: ${this.newProvider}`);
      return {
        success: false,
        error: 'Provider API configuration not available'
      };
    }
    
    // Log the porting initiation attempt
    console.log(`Initiating porting request with ${this.newProvider} API for number: ${this.mobileNumber}`);
    
    // Prepare payload for provider API
    const payload = {
      msisdn: this.mobileNumber,
      upc: this.upc || '',
      customerName: this.metadata.fullName,
      customerEmail: this.metadata.email,
      customerAlternateNumber: this.metadata.alternateNumber,
      portingDate: this.scheduledDate,
      currentOperator: this.currentProvider,
      circle: this.currentCircle,
      portingId: this.uniquePortingCode
    };
    
    // Make the actual API call to the provider
    let response;
    try {
      // If we're in production mode, use the real API
      if (process.env.NODE_ENV === 'production') {
        response = await this.callProviderApi(providerConfig, payload);
      } else {
        // In development/test mode, simulate the response
        response = await this.simulateProviderApiCall(providerConfig.endpoint, payload);
      }
    } catch (apiError) {
      console.error(`Error calling ${this.newProvider} API:`, apiError);
      return {
        success: false,
        error: `Failed to communicate with ${this.newProvider} API: ${apiError.message}`
      };
    }
    
    // Update porting request with provider reference and status
    if (response.success) {
      this.statusHistory.push({
        status: this.status,
        timestamp: Date.now(),
        notes: `Successfully initiated porting with ${this.newProvider}. Provider reference: ${response.referenceId}`
      });
      
      // Store provider reference ID
      if (!this.metadata) this.metadata = {};
      this.metadata.providerReferenceId = response.referenceId;
      await this.save();
    }
    
    return response;
  } catch (error) {
    console.error('Error initiating provider porting:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate porting with provider'
    };
  }
};

// Make actual API call to the provider's endpoint
portingRequestSchema.methods.callProviderApi = async function(providerConfig, payload) {
  const { endpoint, apiKey, apiSecret } = providerConfig;
  
  // Generate authentication headers based on provider requirements
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'X-API-Secret': apiSecret,
    'X-Request-ID': `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
  };
  
  try {
    // Configure timeout and retry options
    const requestOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      timeout: 15000 // 15 seconds timeout
    };
    
    // Use node-fetch for making the API request
    const fetch = require('node-fetch');
    const response = await fetch(endpoint, requestOptions);
    
    // Process response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Provider API responded with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Map the provider's response structure to our standardized format
    return {
      success: true,
      message: data.message || 'Porting request received by provider',
      referenceId: data.referenceId || data.requestId || data.portingId,
      estimatedCompletionTime: new Date(data.estimatedCompletionTime) || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
};

// Get provider-specific API configuration
portingRequestSchema.methods.getProviderApiConfig = async function(providerName) {
  // In production, these would be retrieved from a secure database or environment variables
  const providerApis = {
    'airtel': {
      endpoint: process.env.AIRTEL_PORTING_API_URL || 'https://api.airtel.in/porting/v1/initiate',
      apiKey: process.env.AIRTEL_API_KEY,
      apiSecret: process.env.AIRTEL_API_SECRET,
      planInfoEndpoint: process.env.AIRTEL_PLAN_API_URL || 'https://api.airtel.in/plans/v1/info',
      statusEndpoint: process.env.AIRTEL_STATUS_API_URL || 'https://api.airtel.in/porting/v1/status'
    },
    'jio': {
      endpoint: process.env.JIO_PORTING_API_URL || 'https://api.jio.com/porting/v1/request',
      apiKey: process.env.JIO_API_KEY,
      apiSecret: process.env.JIO_API_SECRET,
      planInfoEndpoint: process.env.JIO_PLAN_API_URL || 'https://api.jio.com/plans/v2/details',
      statusEndpoint: process.env.JIO_STATUS_API_URL || 'https://api.jio.com/porting/v1/status'
    },
    'vi': {
      endpoint: process.env.VI_PORTING_API_URL || 'https://api.vodafoneidea.com/porting/v1/initiate',
      apiKey: process.env.VI_API_KEY,
      apiSecret: process.env.VI_API_SECRET,
      planInfoEndpoint: process.env.VI_PLAN_API_URL || 'https://api.vodafoneidea.com/plans/v1/customer',
      statusEndpoint: process.env.VI_STATUS_API_URL || 'https://api.vodafoneidea.com/porting/v1/status'
    },
    'bsnl': {
      endpoint: process.env.BSNL_PORTING_API_URL || 'https://api.bsnl.co.in/porting/v1/submit',
      apiKey: process.env.BSNL_API_KEY,
      apiSecret: process.env.BSNL_API_SECRET,
      planInfoEndpoint: process.env.BSNL_PLAN_API_URL || 'https://api.bsnl.co.in/plans/v1/current',
      statusEndpoint: process.env.BSNL_STATUS_API_URL || 'https://api.bsnl.co.in/porting/v1/check'
    }
  };
  
  return providerApis[providerName.toLowerCase()] || null;
};

// Check porting status with provider API
portingRequestSchema.methods.checkProviderPortingStatus = async function() {
  try {
    // Get provider-specific API configuration
    const providerConfig = await this.getProviderApiConfig(this.newProvider);
    
    if (!providerConfig) {
      return {
        success: false,
        error: 'Provider API configuration not available'
      };
    }
    
    // Get the reference ID that was stored when porting was initiated
    const referenceId = this.metadata?.providerReferenceId;
    
    if (!referenceId) {
      return {
        success: false,
        error: 'No provider reference ID found for this porting request'
      };
    }
    
    // Make API call to check status in production, simulate in development
    if (process.env.NODE_ENV === 'production') {
      return await this.checkRealPortingStatus(providerConfig, referenceId);
    } else {
      return await this.simulateStatusCheck();
    }
  } catch (error) {
    console.error('Error checking porting status with provider:', error);
    return {
      success: false,
      error: error.message || 'Failed to check porting status'
    };
  }
};

// Check status with real provider API
portingRequestSchema.methods.checkRealPortingStatus = async function(providerConfig, referenceId) {
  try {
    // Use the status endpoint from provider config
    const statusEndpoint = providerConfig.statusEndpoint;
    const apiKey = providerConfig.apiKey;
    const apiSecret = providerConfig.apiSecret;
    
    // Create request headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-API-Secret': apiSecret
    };
    
    // Create request payload
    const payload = {
      referenceId: referenceId
    };
    
    // Make the API call
    const fetch = require('node-fetch');
    const response = await fetch(statusEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      timeout: 10000 // 10 seconds timeout
    });
    
    if (!response.ok) {
      throw new Error(`Status API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map provider-specific status to our standardized format
    let standardizedStatus;
    let details = data.details || data.statusDescription || 'No additional details provided';
    
    // Standardize the status based on known provider response formats
    switch (data.status?.toUpperCase()) {
      case 'INITIATED':
      case 'RECEIVED':
      case 'PROCESSING':
      case 'IN_PROGRESS':
        standardizedStatus = 'RECEIVED';
        break;
      case 'UPC_VERIFIED':
      case 'UPC_VALIDATED':
      case 'ELIGIBILITY_CHECKED':
        standardizedStatus = 'UPC_VALIDATED';
        break;
      case 'ACCEPTED':
      case 'APPROVED':
      case 'READY_FOR_PORT':
        standardizedStatus = 'APPROVED';
        break;
      case 'COMPLETED':
      case 'SUCCESSFUL':
      case 'PORTED':
        standardizedStatus = 'COMPLETED';
        break;
      case 'FAILED':
      case 'REJECTED':
      case 'CANCELLED':
        standardizedStatus = 'FAILED';
        details = `Porting failed: ${details}`;
        break;
      default:
        standardizedStatus = data.status || 'UNKNOWN';
    }
    
    return {
      success: true,
      providerStatus: standardizedStatus,
      details,
      lastUpdated: new Date(data.lastUpdated) || new Date(),
      referenceId,
      rawProviderResponse: data // Store the raw response for debugging
    };
  } catch (error) {
    console.error('Error checking real porting status:', error);
    throw error;
  }
};

// Get customer plan information from provider API
portingRequestSchema.methods.getPlanInformation = async function() {
  // Get provider config for current provider
  const providerConfig = await this.getProviderApiConfig(this.currentProvider);
  
  if (!providerConfig || !providerConfig.planInfoEndpoint) {
    return {
      success: false,
      error: 'Plan information API not available for this provider'
    };
  }
  
  try {
    // In production, make the real API call
    if (process.env.NODE_ENV === 'production') {
      return await this.getRealPlanInformation(providerConfig);
    } else {
      // In development, simulate the response
      return await this.simulatePlanInformation();
    }
  } catch (error) {
    console.error('Error fetching plan information:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve plan information'
    };
  }
};

// Get real plan information from provider API
portingRequestSchema.methods.getRealPlanInformation = async function(providerConfig) {
  try {
    const planInfoEndpoint = providerConfig.planInfoEndpoint;
    const apiKey = providerConfig.apiKey;
    const apiSecret = providerConfig.apiSecret;
    
    // Create request headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-API-Secret': apiSecret
    };
    
    // Create request payload
    const payload = {
      msisdn: this.mobileNumber
    };
    
    // Make the API call
    const fetch = require('node-fetch');
    const response = await fetch(planInfoEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      timeout: 10000 // 10 seconds timeout
    });
    
    if (!response.ok) {
      throw new Error(`Plan Info API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return standardized plan information
    return {
      success: true,
      planName: data.planName || 'Unknown Plan',
      planDetails: data.planDetails || {},
      validUntil: new Date(data.validUntil) || null,
      monthlyCharges: data.monthlyCharges || 0,
      benefits: data.benefits || [],
      freeServices: data.freeServices || []
    };
  } catch (error) {
    console.error('Error fetching real plan information:', error);
    throw error;
  }
};

// Simulate plan information for development/testing
portingRequestSchema.methods.simulatePlanInformation = async function() {
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate realistic plan information based on the provider
  const plansByProvider = {
    'airtel': [
      { name: 'Airtel Unlimited', price: 599, validity: '84 days', data: '2GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'Airtel Value', price: 399, validity: '56 days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'Airtel Basic', price: 249, validity: '28 days', data: '1GB/day', calls: 'Unlimited', sms: '100/day' }
    ],
    'jio': [
      { name: 'Jio Freedom', price: 499, validity: '84 days', data: '2GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'Jio Digital', price: 349, validity: '56 days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'Jio Smart', price: 239, validity: '28 days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day' }
    ],
    'vi': [
      { name: 'Vi Unlimited', price: 649, validity: '84 days', data: '2GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'Vi Value', price: 409, validity: '56 days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'Vi Basic', price: 269, validity: '28 days', data: '1GB/day', calls: 'Unlimited', sms: '100/day' }
    ],
    'bsnl': [
      { name: 'BSNL Value', price: 499, validity: '84 days', data: '1GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'BSNL Basic', price: 329, validity: '56 days', data: '1GB/day', calls: 'Unlimited', sms: '100/day' },
      { name: 'BSNL Mini', price: 199, validity: '28 days', data: '1GB/day', calls: 'Unlimited', sms: '100/day' }
    ]
  };
  
  // Get plans for this provider
  const providerPlans = plansByProvider[this.currentProvider.toLowerCase()] || plansByProvider.airtel;
  
  // Randomly select a plan
  const randomPlan = providerPlans[Math.floor(Math.random() * providerPlans.length)];
  
  // Calculate valid until date
  const validityDays = parseInt(randomPlan.validity.split(' ')[0]);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validityDays);
  
  return {
    success: true,
    planName: randomPlan.name,
    planDetails: {
      price: randomPlan.price,
      validity: randomPlan.validity,
      data: randomPlan.data,
      calls: randomPlan.calls,
      sms: randomPlan.sms
    },
    validUntil: validUntil,
    monthlyCharges: randomPlan.price,
    benefits: [
      `${randomPlan.data} 4G data`,
      randomPlan.calls + ' voice calls',
      randomPlan.sms + ' SMS'
    ],
    freeServices: [
      'Subscription to Provider App',
      'Weekend Data Rollover',
      'Caller Tune'
    ]
  };
};

// Simulate provider API call (to be replaced with actual API calls in production)
portingRequestSchema.methods.simulateProviderApiCall = async function(endpoint, payload) {
  console.log(`[SIMULATION] Making API call to: ${endpoint}`);
  console.log('[SIMULATION] Payload:', JSON.stringify(payload, null, 2));
  
  // In production, this would make an actual HTTP request to the provider API
  // For development, we'll simulate a successful response after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90% success rate simulation
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        resolve({
          success: true,
          message: 'Porting request received by provider',
          referenceId: `PROV-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          estimatedCompletionTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        });
      } else {
        resolve({
          success: false,
          error: 'Provider API temporarily unavailable',
          errorCode: 'PROVIDER_UNAVAILABLE'
        });
      }
    }, 1500); // Simulate network delay
  });
};

// Add method to schedule notifications
portingRequestSchema.methods.scheduleNotifications = function () {
  const notifications = [];
  
  // Schedule SMS notification - 1 day before SMS needs to be sent
  notifications.push({
    type: 'sms',
    scheduledFor: new Date(this.smsDate.getTime() - 24 * 60 * 60 * 1000),
    message: `Please send SMS PORT to 1900 tomorrow for your mobile number ${this.mobileNumber} to start the porting process.`
  });
  
  // Schedule email notification - On SMS date
  notifications.push({
    type: 'email',
    scheduledFor: this.smsDate,
    message: `Today is the day to send SMS PORT to 1900 for your mobile number ${this.mobileNumber}. This is needed to generate your UPC code.`
  });
  
  // Schedule porting center visit notification - 1 day before porting date
  notifications.push({
    type: 'sms',
    scheduledFor: new Date(this.scheduledDate.getTime() - 24 * 60 * 60 * 1000),
    message: `Your appointment to visit the porting center is tomorrow. Please visit ${this.portingCenterDetails.name} at ${this.portingCenterDetails.address}.`
  });
  
  // Schedule SIM insertion notification - On porting date
  notifications.push({
    type: 'email',
    scheduledFor: this.scheduledDate,
    message: `Your porting process is almost complete. After receiving your new SIM, please insert it into your device.`
  });
  
  // If automation is enabled, add special mobile SMS notification
  if (this.automatePorting) {
    notifications.push({
      type: 'mobile_sms',
      scheduledFor: this.smsDate,
      message: 'PORT',
      automatedSms: true,
      targetNumber: '1900'
    });
  }
  
  this.notifications = notifications;
  return this.save();
};

const PortingRequest = mongoose.model('PortingRequest', portingRequestSchema);

export default PortingRequest; 