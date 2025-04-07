const nodemailer = require('nodemailer');
// This is a placeholder - you would need to use an actual SMS API
// like Twilio, Vonage, or a local provider like TextLocal for India
const smsClient = {
  sendSMS: (to, message) => {
    console.log(`SMS to ${to}: ${message}`);
    return Promise.resolve({ success: true, messageId: `mock-${Date.now()}` });
  }
};

// Email transporter configuration
// For production, use actual SMTP credentials
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send an SMS notification
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content
 * @returns {Promise} - Result of SMS sending
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    const result = await smsClient.sendSMS(phoneNumber, message);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send an email notification
 * @param {string} email - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} message - Email content (can be HTML)
 * @returns {Promise} - Result of email sending
 */
const sendEmail = async (email, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"PortMySim" <no-reply@portmysim.com>',
      to: email,
      subject,
      html: message
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send an app notification (if we have a mobile app)
 * This would typically use Firebase Cloud Messaging or similar
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data for the notification
 * @returns {Promise} - Result of notification sending
 */
const sendAppNotification = async (userId, title, body, data = {}) => {
  // This is a placeholder - implement with actual push notification service
  console.log(`App notification to ${userId}: ${title} - ${body}`);
  return Promise.resolve({ success: true, notificationId: `app-${Date.now()}` });
};

/**
 * Process pending notifications from the database
 * @returns {Promise} - Number of notifications processed
 */
const processPendingNotifications = async () => {
  const PortingRequest = require('../models/PortingRequest.model');
  const User = require('../models/User.model');
  
  // Find all unsent notifications scheduled for now or in the past
  const now = new Date();
  const portingRequests = await PortingRequest.find({
    'notifications.sent': false,
    'notifications.scheduledFor': { $lte: now }
  }).populate('user', 'email phoneNumber');
  
  let processed = 0;
  
  for (const request of portingRequests) {
    const user = await User.findById(request.user);
    if (!user) continue;
    
    for (let i = 0; i < request.notifications.length; i++) {
      const notification = request.notifications[i];
      
      // Skip if already sent or scheduled for future
      if (notification.sent || notification.scheduledFor > now) continue;
      
      let result = { success: false };
      
      // Send notification based on type
      switch (notification.type) {
        case 'sms':
          result = await sendSMS(request.mobileNumber, notification.message);
          break;
        case 'email':
          result = await sendEmail(
            user.email,
            'PortMySim - Important Porting Update',
            `<h2>Porting Update</h2><p>${notification.message}</p>`
          );
          break;
        case 'app':
          result = await sendAppNotification(
            request.user.toString(),
            'Porting Update',
            notification.message
          );
          break;
        case 'mobile_sms':
          // This will be handled by the mobile app, just mark it as ready for the app to process
          console.log(`Automated SMS to ${notification.targetNumber} ready for mobile app pickup: ${notification.message}`);
          result = await prepareAutomatedSms(
            request.user.toString(),
            notification.targetNumber,
            notification.message
          );
          break;
      }
      
      // Update notification status in database
      if (result.success) {
        request.notifications[i].sent = true;
        request.notifications[i].sentAt = new Date();
        processed++;
      }
    }
    
    // Save the updated document
    await request.save();
  }
  
  return processed;
};

/**
 * Prepare an automated SMS to be sent by the mobile app
 * This adds the SMS to a queue that the mobile app can poll
 * @param {string} userId - User ID
 * @param {string} targetNumber - The number to SMS (e.g., 1900)
 * @param {string} message - Message content
 * @returns {Promise} - Result of preparation
 */
const prepareAutomatedSms = async (userId, targetNumber, message) => {
  // Create a model for automated SMS queue if it doesn't exist
  let AutomatedSmsQueue;
  try {
    AutomatedSmsQueue = require('../models/AutomatedSmsQueue.model');
  } catch (error) {
    // If the model doesn't exist, define it
    const mongoose = require('mongoose');
    
    const automatedSmsQueueSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      targetNumber: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      processedAt: Date,
      result: {
        success: Boolean,
        error: String
      }
    });
    
    AutomatedSmsQueue = mongoose.model('AutomatedSmsQueue', automatedSmsQueueSchema);
  }
  
  // Add to the queue
  try {
    await new AutomatedSmsQueue({
      user: userId,
      targetNumber,
      message
    }).save();
    
    return { success: true };
  } catch (error) {
    console.error('Error preparing automated SMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get pending automated SMS for a user's mobile app
 * This is used by the mobile app to know what SMS to send
 * @param {string} userId - User ID
 * @returns {Promise} - List of pending SMS
 */
const getPendingAutomatedSms = async (userId) => {
  try {
    const AutomatedSmsQueue = mongoose.model('AutomatedSmsQueue');
    const pendingSms = await AutomatedSmsQueue.find({
      user: userId,
      status: 'pending'
    }).sort('createdAt');
    
    return {
      success: true,
      data: pendingSms.map(sms => ({
        id: sms._id,
        targetNumber: sms.targetNumber,
        message: sms.message
      }))
    };
  } catch (error) {
    console.error('Error getting pending automated SMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update automated SMS status from the mobile app
 * @param {string} smsId - SMS ID
 * @param {boolean} success - Whether SMS was sent successfully
 * @param {string} error - Error message if any
 * @returns {Promise} - Result of update
 */
const updateAutomatedSmsStatus = async (smsId, success, error) => {
  try {
    const AutomatedSmsQueue = mongoose.model('AutomatedSmsQueue');
    const sms = await AutomatedSmsQueue.findById(smsId);
    
    if (!sms) {
      return { success: false, error: 'SMS not found' };
    }
    
    sms.status = success ? 'sent' : 'failed';
    sms.processedAt = new Date();
    sms.result = { success, error };
    
    await sms.save();
    
    return { success: true };
  } catch (error) {
    console.error('Error updating automated SMS status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate a reminder notification based on a template
 * @param {string} templateType - The type of reminder template
 * @param {Object} data - Data to fill the template
 * @returns {string} - Formatted message
 */
const generateReminderMessage = (templateType, data) => {
  const templates = {
    'port_sms_reminder': `Don't forget to send SMS PORT to 1900 tomorrow for your mobile number ${data.mobileNumber} to start the porting process.`,
    'port_sms_today': `Today is the day to send SMS PORT to 1900 for your mobile number ${data.mobileNumber}. This is needed to generate your UPC code.`,
    'documents_reminder': `Please remember to bring your ID proof, address proof, and a passport-sized photograph to the porting center tomorrow.`,
    'porting_center_visit': `Your appointment to visit the porting center is tomorrow. Please visit ${data.centerName} at ${data.centerAddress} during your ${data.timeSlot} slot.`,
    'sim_activation': `Congratulations! Your new SIM card for ${data.newProvider} is ready to be activated. Please insert it into your device.`,
    'upc_code_received': `Your UPC code ${data.upcCode} has been received. We'll proceed with the next steps of your porting process.`,
    'custom': data.message
  };

  return templates[templateType] || templates.custom;
};

/**
 * Schedule multiple reminders for a porting request
 * @param {string} portingRequestId - The ID of the porting request
 * @param {Array} reminders - Array of reminder objects with type, templateType, and scheduledFor
 * @returns {Promise} - Result of scheduling
 */
const scheduleReminders = async (portingRequestId, reminders) => {
  const PortingRequest = require('../models/PortingRequest.model');
  
  try {
    const portingRequest = await PortingRequest.findById(portingRequestId);
    if (!portingRequest) {
      return { success: false, error: 'Porting request not found' };
    }
    
    const notifications = [];
    
    for (const reminder of reminders) {
      // Generate message from template
      const message = generateReminderMessage(reminder.templateType, {
        mobileNumber: portingRequest.mobileNumber,
        centerName: portingRequest.portingCenterDetails?.name,
        centerAddress: portingRequest.portingCenterDetails?.address,
        timeSlot: portingRequest.metadata?.timeSlot,
        newProvider: portingRequest.newProvider,
        upcCode: portingRequest.upc,
        message: reminder.message
      });
      
      notifications.push({
        type: reminder.type,
        scheduledFor: new Date(reminder.scheduledFor),
        message,
        sent: false
      });
    }
    
    // Add to existing notifications
    portingRequest.notifications.push(...notifications);
    await portingRequest.save();
    
    return { 
      success: true, 
      data: {
        count: notifications.length,
        notifications: portingRequest.notifications.slice(-notifications.length)
      }
    };
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel all pending notifications for a porting request
 * @param {string} portingRequestId - The ID of the porting request
 * @returns {Promise} - Result of cancellation
 */
const cancelAllPendingNotifications = async (portingRequestId) => {
  const PortingRequest = require('../models/PortingRequest.model');
  
  try {
    const portingRequest = await PortingRequest.findById(portingRequestId);
    if (!portingRequest) {
      return { success: false, error: 'Porting request not found' };
    }
    
    // Filter out unsent notifications
    const sentNotifications = portingRequest.notifications.filter(n => n.sent);
    const cancelledCount = portingRequest.notifications.length - sentNotifications.length;
    
    // Replace notifications array with only sent ones
    portingRequest.notifications = sentNotifications;
    await portingRequest.save();
    
    return { 
      success: true, 
      data: {
        cancelledCount
      }
    };
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    return { success: false, error: error.message };
  }
};

// Schedule notification processing to run every minute
setInterval(async () => {
  try {
    const processed = await processPendingNotifications();
    if (processed > 0) {
      console.log(`Processed ${processed} notifications`);
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
}, 60000);

module.exports = {
  sendSMS,
  sendEmail,
  sendAppNotification,
  processPendingNotifications,
  generateReminderMessage,
  scheduleReminders,
  cancelAllPendingNotifications,
  prepareAutomatedSms,
  getPendingAutomatedSms,
  updateAutomatedSmsStatus
}; 