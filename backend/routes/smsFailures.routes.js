import express from 'express';
import {
  getSmsFailures,
  getSmsFailure,
  retrySmsFailure,
  updateSmsFailure,
  deleteSmsFailure
} from '../controllers/smsFailures.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes and require admin role
router.use(protect, admin);

// Get all SMS failures with filtering and pagination
router.get('/', getSmsFailures);

// Get single SMS failure by ID
router.get('/:id', getSmsFailure);

// Retry a failed SMS
router.post('/:id/retry', retrySmsFailure);

// Update SMS failure status
router.put('/:id', updateSmsFailure);

// Delete SMS failure
router.delete('/:id', deleteSmsFailure);

export default router; 