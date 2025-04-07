const mongoose = require('mongoose');

// Porting Center Schema
const portingCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    provider: {
      type: String,
      required: [true, 'Please add a service provider'],
      enum: ['airtel', 'jio', 'vi', 'bsnl', 'mtnl'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      formattedAddress: String
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    circle: {
      type: String,
      required: [true, 'Please add a telecom circle'],
      trim: true
    },
    contactNumber: {
      type: String,
      match: [
        /^[0-9]{10,12}$/,
        'Please add a valid contact number'
      ]
    },
    email: String,
    openingHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String
    },
    services: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for geo queries
portingCenterSchema.index({ location: '2dsphere' });

// Method to find nearby centers by distance in km
portingCenterSchema.statics.findNearby = async function(lat, lng, radius, provider) {
  const query = {
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius / 6378.1] // Convert radius to radians
      }
    }
  };
  
  // Add provider filter if specified
  if (provider) {
    query.provider = provider;
  }
  
  return this.find(query).sort({ name: 1 });
};

const PortingCenter = mongoose.model('PortingCenter', portingCenterSchema);

module.exports = PortingCenter; 