import express from 'express';
import networkCoverageController from '../controllers/networkCoverageController.js';

const router = express.Router();

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

export default router; 