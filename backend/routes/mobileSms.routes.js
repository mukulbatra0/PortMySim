import express from 'express';
import mobileSmsController from '../controllers/mobileSms.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes need authentication
router.use(protect);

// Get pending SMS to be sent by mobile app
router.get('/pending', mobileSmsController.getPendingSms);

// Update SMS status from mobile app
router.put('/:smsId', mobileSmsController.updateSmsStatus);

export default router; 