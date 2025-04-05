const mongoose = require('mongoose');

// Schema for network quality by operator
const networkQualitySchema = new mongoose.Schema({
  airtel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  jio: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  vi: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  bsnl: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, { _id: false });

// Schema for data speed by operator
const dataSpeedSchema = new mongoose.Schema({
  airtel: {
    type: Number,
    min: 0,
    default: 0
  },
  jio: {
    type: Number,
    min: 0,
    default: 0
  },
  vi: {
    type: Number,
    min: 0,
    default: 0
  },
  bsnl: {
    type: Number,
    min: 0,
    default: 0
  }
}, { _id: false });

// Schema for population coverage by operator
const populationCoverageSchema = new mongoose.Schema({
  airtel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  jio: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  vi: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  bsnl: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { _id: false });

// Telecom Circle Schema
const telecomCircleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Please add a circle ID'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please add a circle name'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Please add a circle code'],
      trim: true
    },
    regions: [{
      type: String,
      trim: true
    }],
    major_cities: [{
      type: String,
      trim: true
    }],
    operators: [{
      type: String,
      enum: ['airtel', 'jio', 'vi', 'bsnl']
    }],
    network_quality: {
      type: networkQualitySchema,
      default: {}
    },
    average_data_speed: {
      type: dataSpeedSchema,
      default: {}
    },
    population_coverage: {
      type: populationCoverageSchema,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const TelecomCircle = mongoose.model('TelecomCircle', telecomCircleSchema);

module.exports = TelecomCircle; 