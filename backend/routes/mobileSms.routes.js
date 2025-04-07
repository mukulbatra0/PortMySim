const express = require('express');
const router = express.Router();
const mobileSmsController = require('../controllers/mobileSms.controller');
const { protect } = require('../middlewares/auth');

// All routes need authentication
router.use(protect);

// Get pending SMS to be sent by mobile app
router.get('/pending', mobileSmsController.getPendingSms);

// Update SMS status from mobile app
router.put('/:smsId', mobileSmsController.updateSmsStatus);

module.exports = router; 