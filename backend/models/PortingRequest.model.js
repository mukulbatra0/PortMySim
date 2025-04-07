const mongoose = require('mongoose');

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

module.exports = PortingRequest; 