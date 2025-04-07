const PortingCenter = require('../models/PortingCenter.model');
const axios = require('axios');

/**
 * Geocode an address to get latitude and longitude
 * Uses a free geocoding service (Nominatim/OpenStreetMap)
 * For production, consider using Google Maps, MapBox, or other paid services
 * 
 * @param {string} address - Full address to geocode
 * @returns {Object} - Object with lat and lng properties
 */
const geocodeAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'PortMySim/1.0'  // Required by Nominatim
        }
      }
    );
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    
    throw new Error('Address not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
};

/**
 * Find nearby porting centers based on user's location and provider
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} provider - Service provider ID
 * @param {number} radius - Search radius in kilometers (default: 10)
 * @returns {Array} - Array of nearby porting centers
 */
const findNearbyPortingCenters = async (lat, lng, provider, radius = 10) => {
  try {
    // Use the static method from the model
    const centers = await PortingCenter.findNearby(lat, lng, radius, provider);
    
    // Calculate distance and add it to each result
    centers.forEach(center => {
      // Calculate distance in kilometers using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = toRad(center.location.coordinates[1] - lat);
      const dLon = toRad(center.location.coordinates[0] - lng);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat)) * Math.cos(toRad(center.location.coordinates[1])) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      center._doc.distance = parseFloat(distance.toFixed(2));
    });
    
    // Sort by distance
    return centers.sort((a, b) => a._doc.distance - b._doc.distance);
  } catch (error) {
    console.error('Error finding nearby centers:', error);
    throw error;
  }
};

// Helper function to convert degrees to radians
const toRad = (value) => {
  return value * Math.PI / 180;
};

/**
 * Get porting center details by ID
 * 
 * @param {string} centerId - Porting center ID
 * @returns {Object} - Porting center details
 */
const getPortingCenterById = async (centerId) => {
  try {
    const center = await PortingCenter.findById(centerId);
    if (!center) {
      throw new Error('Porting center not found');
    }
    return center;
  } catch (error) {
    console.error('Error fetching porting center:', error);
    throw error;
  }
};

module.exports = {
  geocodeAddress,
  findNearbyPortingCenters,
  getPortingCenterById
}; 