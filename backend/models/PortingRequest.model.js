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
    scheduledDate: {
      type: Date,
      required: [true, 'Please add scheduled porting date']
    },
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
    }
  },
  {
    timestamps: true
  }
);

// Add status change method (will be fully implemented in Step 5)
portingRequestSchema.methods.updateStatus = function (newStatus, notes) {
  // We'll implement this in Step 5
};

const PortingRequest = mongoose.model('PortingRequest', portingRequestSchema);

module.exports = PortingRequest; 