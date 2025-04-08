import NetworkCoverage from '../models/NetworkCoverage.model.js';

/**
 * Network Coverage Controller
 * Handles API requests related to network coverage comparison
 */

/**
 * Get all locations with network coverage data
 * @route GET /api/network-coverage/locations
 * @returns {array} - List of location names
 */
const getLocationsWithCoverage = async (req, res) => {
  try {
    // Query unique locations from the database
    const locations = await NetworkCoverage.aggregate([
      { $group: { _id: "$location" } },
      { $project: { _id: 0, name: "$_id" } },
      { $sort: { name: 1 } }
    ]);

    // Extract just the location names
    const locationNames = locations.map(loc => loc.name);
    
    return res.status(200).json(locationNames);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

/**
 * Get network coverage data for a specific location
 * @route GET /api/network-coverage
 * @param {string} location - Location name
 * @returns {object} - Network coverage data
 */
const getNetworkCoverage = async (req, res) => {
  try {
    const { location, operator } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }
    
    // Create query filter
    const filter = { location: new RegExp(location, 'i') };
    if (operator) {
      filter.operator = operator;
    }
    
    // Find coverage data from database
    const coverageData = await NetworkCoverage.find(filter);
    
    if (coverageData.length === 0) {
      return res.status(404).json({ error: 'No coverage data found for this location' });
    }
    
    // Process and format the data for response
    const formattedData = {
      location: location,
      coordinates: coverageData[0].locationCoordinates.coordinates.reverse(), // Convert to [lat, lng]
    };
    
    // Group by operator and technology type
    const operators = ['jio', 'airtel', 'vi'];
    const techTypes = ['4g', '5g'];
    
    operators.forEach(op => {
      formattedData[op] = {};
      
      techTypes.forEach(tech => {
        const operatorTechData = coverageData.find(
          item => item.operator === op && item.technologyType === tech
        );
        
        if (operatorTechData) {
          formattedData[op][tech] = {
            coverage: operatorTechData.signalStrength,
            speed: operatorTechData.downloadSpeed,
            callQuality: operatorTechData.callQuality,
            indoorReception: operatorTechData.indoorReception
          };
        } else {
          // Default values if no data found
          formattedData[op][tech] = {
            coverage: 0,
            speed: 0,
            callQuality: 0,
            indoorReception: 0
          };
        }
      });
    });
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching network coverage:', error);
    return res.status(500).json({ error: 'Failed to fetch network coverage data' });
  }
};

/**
 * Compare networks for a specific location
 * @route GET /api/network-coverage/compare
 * @param {string} location - Location name
 * @returns {object} - Comparative network data
 */
const compareNetworks = async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }
    
    // Get coverage data from database
    const coverageData = await NetworkCoverage.find({
      location: new RegExp(location, 'i')
    });
    
    if (coverageData.length === 0) {
      return res.status(404).json({ error: 'No coverage data found for this location' });
    }
    
    // Process and format the data for comparison
    const networks = {};
    const ratings = {};
    
    // Group by operator and technology type
    const operators = ['jio', 'airtel', 'vi'];
    const techTypes = ['4g', '5g'];
    
    operators.forEach(op => {
      networks[op] = {};
      
      techTypes.forEach(tech => {
        const operatorTechData = coverageData.find(
          item => item.operator === op && item.technologyType === tech
        );
        
        if (operatorTechData) {
          networks[op][tech] = {
            coverage: operatorTechData.signalStrength,
            speed: operatorTechData.downloadSpeed,
            callQuality: operatorTechData.callQuality,
            indoorReception: operatorTechData.indoorReception
          };
        } else {
          // Default values if no data found
          networks[op][tech] = {
            coverage: 0,
            speed: 0,
            callQuality: 0,
            indoorReception: 0
          };
        }
      });
      
      // Calculate overall ratings using 4G data (could be weighted with 5G data)
      const data4G = networks[op]['4g'];
      if (data4G) {
        ratings[op] = Math.round(
          (data4G.coverage * 0.3) +
          (data4G.speed * 1.5) +
          (data4G.callQuality * 10) +
          (data4G.indoorReception * 10)
        );
      } else {
        ratings[op] = 0;
      }
    });
    
    return res.status(200).json({
      location: location,
      networks,
      ratings
    });
  } catch (error) {
    console.error('Error comparing networks:', error);
    return res.status(500).json({ error: 'Failed to compare networks' });
  }
};

/**
 * Get best network for a location based on criteria
 * @route GET /api/network-coverage/best-network
 * @param {string} location - Location name
 * @param {string} criteria - Criteria for comparison (overall, coverage, speed, callQuality, indoorReception)
 * @returns {object} - Best network data
 */
const getBestNetwork = async (req, res) => {
  try {
    const { location, lat, lng, criteria = 'overall' } = req.query;
    
    if (!location && (!lat || !lng)) {
      return res.status(400).json({ error: 'Location or coordinates are required' });
    }
    
    let coverageData;
    
    if (location) {
      // Find coverage data by location name
      coverageData = await NetworkCoverage.find({
        location: new RegExp(location, 'i')
      });
    } else {
      // Find nearest location by coordinates
      const point = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]  // MongoDB uses [lng, lat]
      };
      
      coverageData = await NetworkCoverage.find({
        locationCoordinates: {
          $near: {
            $geometry: point,
            $maxDistance: 50000  // 50km radius
          }
        }
      });
    }
    
    if (coverageData.length === 0) {
      return res.status(404).json({ error: 'No coverage data found for this location/coordinates' });
    }
    
    // Extract location info
    const locationName = coverageData[0].location;
    
    // Group by operator and tech type
    const operators = ['jio', 'airtel', 'vi'];
    const techType = '4g';  // Using 4G for comparison
    
    let rankings;
    
    switch (criteria) {
      case 'coverage':
        rankings = operators.map(op => {
          const opData = coverageData.find(
            item => item.operator === op && item.technologyType === techType
          );
          return {
            operator: op,
            score: opData ? Math.round(opData.signalStrength) : 0
          };
        });
        break;
      case 'speed':
        rankings = operators.map(op => {
          const opData = coverageData.find(
            item => item.operator === op && item.technologyType === techType
          );
          return {
            operator: op,
            score: opData ? Math.round(opData.downloadSpeed) : 0
          };
        });
        break;
      case 'callQuality':
        rankings = operators.map(op => {
          const opData = coverageData.find(
            item => item.operator === op && item.technologyType === techType
          );
          return {
            operator: op,
            score: opData ? Math.round(opData.callQuality * 100) : 0
          };
        });
        break;
      case 'indoorReception':
        rankings = operators.map(op => {
          const opData = coverageData.find(
            item => item.operator === op && item.technologyType === techType
          );
          return {
            operator: op,
            score: opData ? Math.round(opData.indoorReception * 100) : 0
          };
        });
        break;
      default:  // overall
        rankings = operators.map(op => {
          const opData = coverageData.find(
            item => item.operator === op && item.technologyType === techType
          );
          if (!opData) return { operator: op, score: 0 };
          
          // Calculate weighted score
          const score = Math.round(
            (opData.signalStrength * 0.3) +
            (opData.downloadSpeed * 1.5) +
            (opData.callQuality * 10) +
            (opData.indoorReception * 10)
          );
          
          return { operator: op, score };
        });
    }
    
    // Sort by score descending
    rankings.sort((a, b) => b.score - a.score);
    
    return res.status(200).json({
      location: locationName,
      criteria,
      rankings
    });
  } catch (error) {
    console.error('Error finding best network:', error);
    return res.status(500).json({ error: 'Failed to find best network' });
  }
};

/**
 * Get tower data for a location
 * @route GET /api/network-coverage/tower-data
 * @param {string} location - Location name
 * @returns {object} - Tower data
 */
const getTowerData = async (req, res) => {
  try {
    const { location, operator } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }
    
    // Create query filter
    const filter = { location: new RegExp(location, 'i') };
    if (operator) {
      filter.operator = operator;
    }
    
    // Find coverage data from database
    const coverageData = await NetworkCoverage.find(filter);
    
    if (coverageData.length === 0) {
      return res.status(404).json({ error: 'No tower data found for this location' });
    }
    
    // Process and format the tower data
    const towerData = coverageData.map(data => ({
      operator: data.operator,
      technologyType: data.technologyType,
      location: data.location,
      coordinates: data.locationCoordinates.coordinates.reverse(),  // Convert to [lat, lng]
      signalStrength: data.signalStrength,
      downloadSpeed: data.downloadSpeed,
      uploadSpeed: data.uploadSpeed,
      latency: data.latency,
      callQuality: data.callQuality,
      indoorReception: data.indoorReception,
      lastUpdated: data.updatedAt
    }));
    
    return res.status(200).json(towerData);
  } catch (error) {
    console.error('Error fetching tower data:', error);
    return res.status(500).json({ error: 'Failed to fetch tower data' });
  }
};

export default {
  getLocationsWithCoverage,
  getNetworkCoverage,
  compareNetworks,
  getBestNetwork,
  getTowerData
};