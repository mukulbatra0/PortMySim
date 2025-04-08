import express from 'express';
import {
  createReminderNotification,
  getPendingNotifications,
  cancelNotification,
  sendNotificationNow,
  updateNotification,
  scheduleMultipleReminders,
  cancelAllNotifications
} from '../controllers/notifications.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a new reminder notification
router.post('/reminder', createReminderNotification);

// Schedule multiple reminders using templates
router.post('/schedule-reminders', scheduleMultipleReminders);

// Get all pending notifications for a porting request
router.get('/pending/:portingRequestId', getPendingNotifications);

// Send a notification immediately
router.post('/send-now', sendNotificationNow);

// Cancel all pending notifications for a porting request
router.delete('/cancel-all/:portingRequestId', cancelAllNotifications);

// Cancel a scheduled notification
router.delete('/:portingRequestId/:notificationId', cancelNotification);

// Update a scheduled notification
router.put('/:portingRequestId/:notificationId', updateNotification);

export default router; 