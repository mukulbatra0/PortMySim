import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import axios from 'axios';
import fast2sms from 'fast-two-sms';
import PortingRequest from '../models/PortingRequest.model.js';
import User from '../models/User.model.js';
import AutomatedSmsQueue from '../models/AutomatedSmsQueue.model.js';
import SmsFailureLog from '../models/SmsFailureLog.model.js';

// Fast2SMS configuration
const fast2smsConfig = {
  baseUrl: 'https://www.fast2sms.com/dev/bulkV2',
  authorization: process.env.FAST2SMS_API_KEY,
  route: process.env.FAST2SMS_ROUTE || 'q', // 'q' for promotional, 'dlt' for transactional
  flash: '0',
  maxRetries: 3,
  retryDelay: 2000 // 2 seconds
};

// Fast2SMS error code map for better error messages
const fast2smsErrorMap = {
  '303': 'Invalid API key',
  '304': 'Account deactivated or suspended',
  '305': 'Invalid sender ID',
  '306': 'Invalid DLT template',
  '307': 'Invalid message content',
  '308': 'Invalid phone number',
  '309': 'Insufficient credit balance',
  '310': 'Invalid route specified',
  '311': 'Message scheduling failed',
  '312': 'Rate limit exceeded',
  '313': 'Message too long',
  'default': 'Unknown Fast2SMS error'
};

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

// Porting notification templates
const portingTemplates = {
  // Template IDs from Fast2SMS DLT
  PORTING_CONFIRMATION: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_CONF,
    variables: ['#mobile#', '#ref#', '#date#', '#center#']
  },
  SMS_REMINDER: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_SMS,
    variables: ['#mobile#', '#date#']
  },
  CENTER_VISIT: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_CENTER,
    variables: ['#mobile#', '#center#', '#address#', '#time#']
  },
  DOCUMENTS_REMINDER: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_DOCS,
    variables: ['#mobile#', '#date#']
  },
  SIM_ACTIVATION: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_ACTIVE,
    variables: ['#mobile#', '#provider#']
  },
  UPC_RECEIVED: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_UPC,
    variables: ['#mobile#', '#upc#']
  }
};

/**
 * Send an SMS notification using Fast2SMS bulkV2 API with retry
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content
 * @param {string} scheduleTime - Optional schedule time (YYYY-MM-DD HH:mm:ss)
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise} - Result of SMS sending
 */
const sendSMS = async (phoneNumber, message, scheduleTime = null, retryCount = 0) => {
  try {
    // Clean phone number (remove any non-numeric characters)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Validate phone number format for Indian numbers
    if (cleanNumber.length !== 10 && !(cleanNumber.length === 12 && cleanNumber.startsWith('91'))) {
      console.error('Invalid phone number format for Fast2SMS');
      return { success: false, error: 'Invalid phone number format' };
    }

    const params = new URLSearchParams({
      authorization: fast2smsConfig.authorization,
      route: fast2smsConfig.route,
      message: message,
      numbers: cleanNumber,
      flash: fast2smsConfig.flash
    });

    // Add schedule_time if provided
    if (scheduleTime) {
      params.append('schedule_time', scheduleTime);
    }

    const response = await axios.get(`${fast2smsConfig.baseUrl}?${params.toString()}`);
    
    if (response.data.return === true) {
      console.log('SMS sent successfully via Fast2SMS:', response.data);
      return { 
        success: true, 
        result: {
          messageId: response.data.request_id,
          status: response.data.message[0]
        }
      };
    } else {
      const errorCode = response.data.code || 'default';
      const errorMessage = fast2smsErrorMap[errorCode] || fast2smsErrorMap.default;
      
      console.error(`Fast2SMS error (${errorCode}): ${errorMessage}`, response.data);
      
      // Retry if we haven't reached max retries and the error is retryable
      const isRetryableError = ['309', '311', '312'].includes(errorCode);
      
      if (isRetryableError && retryCount < fast2smsConfig.maxRetries) {
        console.log(`Retrying SMS (attempt ${retryCount + 1} of ${fast2smsConfig.maxRetries})...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, fast2smsConfig.retryDelay));
        return sendSMS(phoneNumber, message, scheduleTime, retryCount + 1);
      }
      
      // If all retries failed or error is not retryable, log the failure
      if (!isRetryableError || retryCount >= fast2smsConfig.maxRetries) {
        const error = { 
          code: errorCode, 
          error: errorMessage
        };
        await logSmsFailure(phoneNumber, message, error, null, null, null, null, scheduleTime);
      }
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode
      };
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    
    // Retry if network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      if (retryCount < fast2smsConfig.maxRetries) {
        console.log(`Network error. Retrying SMS (attempt ${retryCount + 1} of ${fast2smsConfig.maxRetries})...`);
        // Exponential backoff for network errors
        const backoffDelay = fast2smsConfig.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return sendSMS(phoneNumber, message, scheduleTime, retryCount + 1);
      }
    }
    
    // Log network errors after all retries
    if (retryCount >= fast2smsConfig.maxRetries) {
      await logSmsFailure(phoneNumber, message, {
        message: error.message,
        isNetworkError: true
      }, null, null, null, null, scheduleTime);
    }
    
    return { 
      success: false, 
      error: error.message,
      isNetworkError: true
    };
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

/**
 * Send a templated SMS using Fast2SMS DLT with retry
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} templateId - DLT template ID
 * @param {Object} variables - Template variables
 * @param {string} scheduleTime - Optional schedule time (YYYY-MM-DD HH:mm:ss)
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise} - Result of SMS sending
 */
const sendTemplatedSMS = async (phoneNumber, templateId, variables, scheduleTime = null, retryCount = 0) => {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10 && !(cleanNumber.length === 12 && cleanNumber.startsWith('91'))) {
      console.error('Invalid phone number format for Fast2SMS');
      return { success: false, error: 'Invalid phone number format' };
    }

    const params = new URLSearchParams({
      authorization: fast2smsConfig.authorization,
      route: 'dlt',
      template_id: templateId,
      variables: JSON.stringify(variables),
      numbers: cleanNumber,
      flash: fast2smsConfig.flash
    });

    // Add schedule_time if provided
    if (scheduleTime) {
      params.append('schedule_time', scheduleTime);
    }

    const response = await axios.get(`${fast2smsConfig.baseUrl}?${params.toString()}`);
    
    if (response.data.return === true) {
      console.log('Templated SMS sent successfully:', response.data);
      return { 
        success: true, 
        result: {
          messageId: response.data.request_id,
          status: response.data.message[0]
        }
      };
    } else {
      const errorCode = response.data.code || 'default';
      const errorMessage = fast2smsErrorMap[errorCode] || fast2smsErrorMap.default;
      
      console.error(`Fast2SMS template error (${errorCode}): ${errorMessage}`, response.data);
      
      // Retry if we haven't reached max retries and the error is retryable
      const isRetryableError = ['309', '311', '312'].includes(errorCode);
      
      if (isRetryableError && retryCount < fast2smsConfig.maxRetries) {
        console.log(`Retrying templated SMS (attempt ${retryCount + 1} of ${fast2smsConfig.maxRetries})...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, fast2smsConfig.retryDelay));
        return sendTemplatedSMS(phoneNumber, templateId, variables, scheduleTime, retryCount + 1);
      }
      
      // If all retries failed or error is not retryable, log the failure
      if (!isRetryableError || retryCount >= fast2smsConfig.maxRetries) {
        const error = { 
          code: errorCode, 
          error: errorMessage
        };
        await logSmsFailure(phoneNumber, 'Templated SMS', error, null, null, templateId, variables, scheduleTime);
      }
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode
      };
    }
  } catch (error) {
    console.error('Failed to send templated SMS:', error);
    
    // Retry if network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      if (retryCount < fast2smsConfig.maxRetries) {
        console.log(`Network error. Retrying templated SMS (attempt ${retryCount + 1} of ${fast2smsConfig.maxRetries})...`);
        // Exponential backoff for network errors
        const backoffDelay = fast2smsConfig.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return sendTemplatedSMS(phoneNumber, templateId, variables, scheduleTime, retryCount + 1);
      }
    }
    
    // Log network errors after all retries
    if (retryCount >= fast2smsConfig.maxRetries) {
      await logSmsFailure(phoneNumber, 'Templated SMS', {
        message: error.message,
        isNetworkError: true
      }, null, null, templateId, variables, scheduleTime);
    }
    
    return { 
      success: false, 
      error: error.message,
      isNetworkError: true
    };
  }
};

/**
 * Send porting confirmation SMS
 * @param {string} phoneNumber - Recipient's phone number
 * @param {Object} data - Porting data
 * @returns {Promise} - Result of SMS sending
 */
const sendPortingConfirmation = async (phoneNumber, data) => {
  const variables = {
    '#mobile#': data.mobileNumber,
    '#ref#': data.refNumber,
    '#date#': data.scheduledDate,
    '#center#': data.centerName
  };

  return await sendTemplatedSMS(
    phoneNumber,
    portingTemplates.PORTING_CONFIRMATION.id,
    variables
  );
};

/**
 * Send SMS reminder for porting process
 * @param {string} phoneNumber - Recipient's phone number
 * @param {Object} data - Reminder data
 * @returns {Promise} - Result of SMS sending
 */
const sendSmsReminder = async (phoneNumber, data) => {
  const variables = {
    '#mobile#': data.mobileNumber,
    '#date#': data.smsDate
  };

  return await sendTemplatedSMS(
    phoneNumber,
    portingTemplates.SMS_REMINDER.id,
    variables
  );
};

/**
 * Send porting center visit reminder
 * @param {string} phoneNumber - Recipient's phone number
 * @param {Object} data - Center visit data
 * @returns {Promise} - Result of SMS sending
 */
const sendCenterVisitReminder = async (phoneNumber, data) => {
  const variables = {
    '#mobile#': data.mobileNumber,
    '#center#': data.centerName,
    '#address#': data.centerAddress,
    '#time#': data.timeSlot
  };

  return await sendTemplatedSMS(
    phoneNumber,
    portingTemplates.CENTER_VISIT.id,
    variables
  );
};

/**
 * Send documents reminder
 * @param {string} phoneNumber - Recipient's phone number
 * @param {Object} data - Documents reminder data
 * @returns {Promise} - Result of SMS sending
 */
const sendDocumentsReminder = async (phoneNumber, data) => {
  const variables = {
    '#mobile#': data.mobileNumber,
    '#date#': data.visitDate
  };

  return await sendTemplatedSMS(
    phoneNumber,
    portingTemplates.DOCUMENTS_REMINDER.id,
    variables
  );
};

/**
 * Send SIM activation notification
 * @param {string} phoneNumber - Recipient's phone number
 * @param {Object} data - Activation data
 * @returns {Promise} - Result of SMS sending
 */
const sendSimActivation = async (phoneNumber, data) => {
  const variables = {
    '#mobile#': data.mobileNumber,
    '#provider#': data.newProvider
  };

  return await sendTemplatedSMS(
    phoneNumber,
    portingTemplates.SIM_ACTIVATION.id,
    variables
  );
};

/**
 * Send UPC code received notification
 * @param {string} phoneNumber - Recipient's phone number
 * @param {Object} data - UPC data
 * @returns {Promise} - Result of SMS sending
 */
const sendUpcReceived = async (phoneNumber, data) => {
  const variables = {
    '#mobile#': data.mobileNumber,
    '#upc#': data.upcCode
  };

  return await sendTemplatedSMS(
    phoneNumber,
    portingTemplates.UPC_RECEIVED.id,
    variables
  );
};

/**
 * Log SMS failures to database for manual review
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content
 * @param {Object} error - Error details
 * @param {string} userId - User ID (optional)
 * @param {string} portingRequestId - Porting request ID (optional)
 * @param {string} templateId - Template ID (optional for templated SMS)
 * @param {Object} variables - Template variables (optional for templated SMS)
 * @param {string} scheduleTime - Schedule time (optional)
 * @returns {Promise} - Result of logging
 */
const logSmsFailure = async (phoneNumber, message, error, userId = null, portingRequestId = null, templateId = null, variables = null, scheduleTime = null) => {
  try {
    // Create a new failure log entry
    const failureLog = new SmsFailureLog({
      userId,
      portingRequestId,
      phoneNumber,
      message,
      errorDetails: {
        code: error.code || null,
        message: error.error || error.message || 'Unknown error',
        isNetworkError: error.isNetworkError || false,
        rawError: error
      },
      templateId,
      variables,
      scheduleTime: scheduleTime ? new Date(scheduleTime) : null
    });
    
    await failureLog.save();
    console.log('SMS failure logged to database with ID:', failureLog._id);
    
    return true;
  } catch (logError) {
    console.error('Failed to log SMS failure to database:', logError);
    return false;
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

export {
  sendSMS,
  sendEmail,
  sendAppNotification,
  processPendingNotifications,
  generateReminderMessage,
  scheduleReminders,
  cancelAllPendingNotifications,
  prepareAutomatedSms,
  getPendingAutomatedSms,
  updateAutomatedSmsStatus,
  sendTemplatedSMS,
  sendPortingConfirmation,
  sendSmsReminder,
  sendCenterVisitReminder,
  sendDocumentsReminder,
  sendSimActivation,
  sendUpcReceived,
  logSmsFailure
}; 