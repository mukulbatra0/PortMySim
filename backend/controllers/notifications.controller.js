const PortingRequest = require('../models/PortingRequest.model');
const User = require('../models/User.model');
const { 
  sendSMS, 
  sendEmail, 
  sendAppNotification, 
  generateReminderMessage,
  scheduleReminders,
  cancelAllPendingNotifications
} = require('../utils/notificationService');

/**
 * @desc    Create a new manual reminder notification
 * @route   POST /api/notifications/reminder
 * @access  Private
 */
exports.createReminderNotification = async (req, res) => {
  try {
    const { portingRequestId, type, message, scheduledFor } = req.body;

    // Validate input
    if (!portingRequestId || !type || !message || !scheduledFor) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: portingRequestId, type, message, scheduledFor'
      });
    }

    // Validate notification type
    if (!['sms', 'email', 'app'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Notification type must be one of: sms, email, app'
      });
    }

    // Find the porting request
    const portingRequest = await PortingRequest.findById(portingRequestId);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check if the user owns this porting request or is an admin
    if (portingRequest.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to add reminders to this porting request'
      });
    }

    // Add the notification to the porting request
    portingRequest.notifications.push({
      type,
      message,
      scheduledFor: new Date(scheduledFor),
      sent: false
    });

    await portingRequest.save();

    return res.status(201).json({
      success: true,
      data: {
        notification: portingRequest.notifications[portingRequest.notifications.length - 1]
      },
      message: 'Reminder notification created successfully'
    });
  } catch (error) {
    console.error('Error creating reminder notification:', error);
    
    // Check if ID is invalid
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get all pending notifications for a porting request
 * @route   GET /api/notifications/pending/:portingRequestId
 * @access  Private
 */
exports.getPendingNotifications = async (req, res) => {
  try {
    const portingRequest = await PortingRequest.findById(req.params.portingRequestId);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check if the user owns this porting request or is an admin
    if (portingRequest.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to view notifications for this porting request'
      });
    }

    // Filter unsent notifications
    const pendingNotifications = portingRequest.notifications
      .filter(notification => !notification.sent)
      .map(notification => ({
        id: notification._id,
        type: notification.type,
        message: notification.message,
        scheduledFor: notification.scheduledFor
      }));

    return res.status(200).json({
      success: true,
      count: pendingNotifications.length,
      data: pendingNotifications
    });
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    
    // Check if ID is invalid
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Cancel a scheduled notification
 * @route   DELETE /api/notifications/:portingRequestId/:notificationId
 * @access  Private
 */
exports.cancelNotification = async (req, res) => {
  try {
    const { portingRequestId, notificationId } = req.params;

    // Find the porting request
    const portingRequest = await PortingRequest.findById(portingRequestId);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check if the user owns this porting request or is an admin
    if (portingRequest.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel notifications for this porting request'
      });
    }

    // Find the notification in the array
    const notificationIndex = portingRequest.notifications.findIndex(
      n => n._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if notification is already sent
    if (portingRequest.notifications[notificationIndex].sent) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a notification that has already been sent'
      });
    }

    // Remove the notification from the array
    portingRequest.notifications.splice(notificationIndex, 1);
    await portingRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Notification cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling notification:', error);
    
    // Check if ID is invalid
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Send a notification immediately
 * @route   POST /api/notifications/send-now
 * @access  Private
 */
exports.sendNotificationNow = async (req, res) => {
  try {
    const { portingRequestId, type, message } = req.body;

    // Validate input
    if (!portingRequestId || !type || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: portingRequestId, type, message'
      });
    }

    // Validate notification type
    if (!['sms', 'email', 'app'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Notification type must be one of: sms, email, app'
      });
    }

    // Find the porting request
    const portingRequest = await PortingRequest.findById(portingRequestId);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check authorization
    if (portingRequest.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to send notifications for this porting request'
      });
    }

    // Get user information
    const user = await User.findById(portingRequest.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Send the notification immediately
    let result = { success: false };
    switch (type) {
      case 'sms':
        result = await sendSMS(portingRequest.mobileNumber, message);
        break;
      case 'email':
        result = await sendEmail(
          user.email,
          'PortMySim - Important Reminder',
          `<h2>Porting Reminder</h2><p>${message}</p>`
        );
        break;
      case 'app':
        result = await sendAppNotification(
          user._id.toString(),
          'Porting Reminder',
          message
        );
        break;
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: `Failed to send ${type} notification: ${result.error || 'Unknown error'}`
      });
    }

    // Add to notification history
    portingRequest.notifications.push({
      type,
      message,
      scheduledFor: new Date(),
      sent: true,
      sentAt: new Date()
    });

    await portingRequest.save();

    return res.status(200).json({
      success: true,
      message: `${type.toUpperCase()} notification sent successfully`
    });
  } catch (error) {
    console.error('Error sending immediate notification:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update a scheduled notification
 * @route   PUT /api/notifications/:portingRequestId/:notificationId
 * @access  Private
 */
exports.updateNotification = async (req, res) => {
  try {
    const { portingRequestId, notificationId } = req.params;
    const { message, scheduledFor, type } = req.body;

    // Find the porting request
    const portingRequest = await PortingRequest.findById(portingRequestId);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check if the user owns this porting request or is an admin
    if (portingRequest.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update notifications for this porting request'
      });
    }

    // Find the notification in the array
    const notificationIndex = portingRequest.notifications.findIndex(
      n => n._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if notification is already sent
    if (portingRequest.notifications[notificationIndex].sent) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a notification that has already been sent'
      });
    }

    // Update the notification
    if (message) portingRequest.notifications[notificationIndex].message = message;
    if (scheduledFor) portingRequest.notifications[notificationIndex].scheduledFor = new Date(scheduledFor);
    if (type && ['sms', 'email', 'app'].includes(type)) {
      portingRequest.notifications[notificationIndex].type = type;
    }

    await portingRequest.save();

    return res.status(200).json({
      success: true,
      data: {
        notification: portingRequest.notifications[notificationIndex]
      },
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    
    // Check if ID is invalid
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Schedule multiple reminders using templates
 * @route   POST /api/notifications/schedule-reminders
 * @access  Private
 */
exports.scheduleReminders = async (req, res) => {
  try {
    const { portingRequestId, reminders } = req.body;

    // Validate input
    if (!portingRequestId || !reminders || !Array.isArray(reminders) || reminders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide portingRequestId and a valid reminders array'
      });
    }

    // Find the porting request
    const portingRequest = await PortingRequest.findById(portingRequestId);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check authorization
    if (portingRequest.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to schedule reminders for this porting request'
      });
    }

    // Schedule the reminders
    const result = await scheduleReminders(portingRequestId, reminders);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: `Scheduled ${result.data.count} reminders successfully`
    });
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Cancel all pending notifications for a porting request
 * @route   DELETE /api/notifications/cancel-all/:portingRequestId
 * @access  Private
 */
exports.cancelAllNotifications = async (req, res) => {
  try {
    const { portingRequestId } = req.params;

    // Find the porting request
    const portingRequest = await PortingRequest.findById(portingRequestId);

    if (!portingRequest) {
      return res.status(404).json({
        success: false,
        error: 'No porting request found with this ID'
      });
    }

    // Check authorization
    if (portingRequest.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel notifications for this porting request'
      });
    }

    // Cancel all pending notifications
    const result = await cancelAllPendingNotifications(portingRequestId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: `Cancelled ${result.data.cancelledCount} pending notifications`
    });
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 