const mongoose = require('mongoose');

// Schema for network coverage data by location
const networkCoverageSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true
    },
    locationCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    coverageRadius: {
      type: Number,
      required: true
    },
    operator: {
      type: String,
      required: [true, 'Operator is required'],
      enum: ['jio', 'airtel', 'vi', 'bsnl'],
      index: true
    },
    technologyType: {
      type: String,
      required: [true, 'Technology type is required'],
      enum: ['4g', '5g'],
      index: true
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    downloadSpeed: {
      type: Number,
      min: 0,
      required: true
    },
    uploadSpeed: {
      type: Number,
      min: 0,
      required: true
    },
    callQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    indoorReception: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    congestionHandling: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    customerSatisfaction: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create a 2dsphere index for geospatial queries
networkCoverageSchema.index({ locationCoordinates: '2dsphere' });

const NetworkCoverage = mongoose.model('NetworkCoverage', networkCoverageSchema);

module.exports = NetworkCoverage; 