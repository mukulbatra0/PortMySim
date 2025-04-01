const mongoose = require('mongoose');

// Plan Schema
const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a plan name'],
      trim: true
    },
    provider: {
      type: String,
      required: [true, 'Please add a service provider']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price']
    },
    validity: {
      type: Number, // in days
      required: [true, 'Please add validity period']
    },
    data: {
      type: String,
      required: [true, 'Please add data allocation']
    },
    dataPerDay: {
      type: String
    },
    calls: {
      type: String,
      required: [true, 'Please add call benefits']
    },
    sms: {
      type: String,
      required: [true, 'Please add SMS benefits']
    },
    otherBenefits: [String],
    description: {
      type: String
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'standard'
    },
    activationFee: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan; 