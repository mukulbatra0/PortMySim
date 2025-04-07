const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Create a new reminder notification
router.post('/reminder', notificationsController.createReminderNotification);

// Schedule multiple reminders using templates
router.post('/schedule-reminders', notificationsController.scheduleReminders);

// Get all pending notifications for a porting request
router.get('/pending/:portingRequestId', notificationsController.getPendingNotifications);

// Send a notification immediately
router.post('/send-now', notificationsController.sendNotificationNow);

// Cancel all pending notifications for a porting request
router.delete('/cancel-all/:portingRequestId', notificationsController.cancelAllNotifications);

// Cancel a scheduled notification
router.delete('/:portingRequestId/:notificationId', notificationsController.cancelNotification);

// Update a scheduled notification
router.put('/:portingRequestId/:notificationId', notificationsController.updateNotification);

module.exports = router; 