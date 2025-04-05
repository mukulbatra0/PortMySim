const express = require('express');
const router = express.Router();
const networkCoverageController = require('../controllers/networkCoverageController');

// Get network coverage data for a specific location
router.get('/network-coverage', networkCoverageController.getNetworkCoverage);

// Compare networks for a specific location
router.get('/network-coverage/compare', networkCoverageController.compareNetworks);

// Get best network for a location
router.get('/network-coverage/best-network', networkCoverageController.getBestNetwork);

// Get locations with coverage data
router.get('/network-coverage/locations', networkCoverageController.getLocationsWithCoverage);

// Get tower data for a location
router.get('/network-coverage/tower-data', networkCoverageController.getTowerData);

module.exports = router; 