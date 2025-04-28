import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import axios from 'axios';
import twilio from 'twilio';
import fast2sms from 'fast-two-sms';
import PortingRequest from '../models/PortingRequest.model.js';
import User from '../models/User.model.js';
import AutomatedSmsQueue from '../models/AutomatedSmsQueue.model.js';
import SmsFailureLog from '../models/SmsFailureLog.model.js';

// Twilio configuration
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  maxRetries: 3,
  retryDelay: 2000 // 2 seconds
};

// Initialize Twilio client if credentials are available
let twilioClient = null;
if (twilioConfig.accountSid && twilioConfig.authToken) {
  twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
} else {
  console.warn('Twilio credentials not found in environment variables. SMS functionality will be limited.');
}

// Fallback to Fast2SMS for Indian numbers
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

// Verify email configuration is working
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  emailTransporter.verify((error) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.warn('Email credentials not found in environment variables. Email functionality will be limited.');
}

// Porting notification templates
const portingTemplates = {
  // Template IDs from Fast2SMS DLT or full message templates
  PORTING_CONFIRMATION: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_CONF,
    variables: ['#mobile#', '#ref#', '#date#', '#center#'],
    template: 'Your porting request for mobile #{mobile} (Ref: #{ref}) has been received. Your scheduled date is #{date}. Visit #{center} to complete the process.'
  },
  SMS_REMINDER: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_SMS,
    variables: ['#mobile#', '#date#'],
    template: 'IMPORTANT: Send SMS with text "PORT" to 1900 from your mobile #{mobile} on #{date} to start the porting process.'
  },
  CENTER_VISIT: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_CENTER,
    variables: ['#mobile#', '#center#', '#address#', '#time#'],
    template: 'Visit #{center} at #{address} on #{time} with your mobile #{mobile} and ID proof to complete your porting process.'
  },
  DOCUMENTS_REMINDER: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_DOCS,
    variables: ['#mobile#', '#date#'],
    template: 'Reminder: For porting mobile #{mobile}, bring your ID proof, address proof, and UPC code on #{date}.'
  },
  SIM_ACTIVATION: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_ACTIVE,
    variables: ['#mobile#', '#provider#'],
    template: 'Congratulations! Your mobile #{mobile} has been successfully ported to #{provider}. Enjoy your new connection!'
  },
  UPC_RECEIVED: {
    id: process.env.FAST2SMS_TEMPLATE_PORT_UPC,
    variables: ['#mobile#', '#upc#'],
    template: 'Your UPC code for mobile #{mobile} is #{upc}. Please keep this confidential and use it to complete your porting process.'
  }
};

/**
 * Send an SMS notification using available providers with smart fallback
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
    
    // Validate phone number format
    if (cleanNumber.length < 10) {
      console.error('Invalid phone number format');
      return { success: false, error: 'Invalid phone number format' };
    }
    
    // Determine if this is an Indian number (starts with 91 or is 10 digits)
    const isIndianNumber = cleanNumber.length === 10 || 
                          (cleanNumber.length === 12 && cleanNumber.startsWith('91'));
    
    let result;
    
    // Try sending with Twilio first if available and not an Indian number
    if (twilioClient && !isIndianNumber) {
      try {
        // Format the number in international format for Twilio
        const formattedNumber = cleanNumber.length === 10 ? 
                               `+1${cleanNumber}` : 
                               `+${cleanNumber}`;
        
        // Send message via Twilio
        const twilioMessage = await twilioClient.messages.create({
          body: message,
          from: twilioConfig.phoneNumber,
          to: formattedNumber,
          scheduleType: scheduleTime ? 'fixed' : undefined,
          sendAt: scheduleTime ? new Date(scheduleTime).toISOString() : undefined
        });
        
        console.log('SMS sent successfully via Twilio:', twilioMessage.sid);
        return { 
          success: true, 
          result: {
            messageId: twilioMessage.sid,
            status: twilioMessage.status,
            provider: 'twilio'
          }
        };
      } catch (twilioError) {
        console.error('Failed to send SMS via Twilio:', twilioError);
        // If this is the last retry, log the failure
        if (retryCount >= twilioConfig.maxRetries - 1) {
          await logSmsFailure(phoneNumber, message, {
            code: twilioError.code,
            message: twilioError.message,
            provider: 'twilio'
          }, null, null, null, null, scheduleTime);
        }
        
        // If it's an Indian number or a specific Twilio error, fall back to Fast2SMS
        if (isIndianNumber) {
          console.log('Falling back to Fast2SMS for Indian number');
          result = await sendSMSViaFast2SMS(phoneNumber, message, scheduleTime, retryCount);
          return result;
        }
      }
    } else if (isIndianNumber && process.env.FAST2SMS_API_KEY) {
      // For Indian numbers, directly use Fast2SMS
      result = await sendSMSViaFast2SMS(phoneNumber, message, scheduleTime, retryCount);
      return result;
    } else {
      // No valid SMS provider available, use the queue for manual sending
      console.warn('No SMS provider available, adding to queue for manual sending');
      
      // Create a log entry for monitoring
      await logSmsFailure(phoneNumber, message, {
        message: 'No SMS provider configured',
        isConfigError: true
      }, null, null, null, null, scheduleTime);
      
      // Return failure result
      return { 
        success: false, 
        error: 'SMS provider not configured',
        queued: true
      };
    }
    
  } catch (error) {
    console.error('Unexpected error in sendSMS:', error);
    
    // Log any unexpected errors
    await logSmsFailure(phoneNumber, message, {
      message: error.message,
      stack: error.stack,
      isUnexpectedError: true
    }, null, null, null, null, scheduleTime);
    
    return { 
      success: false, 
      error: 'Unexpected error while sending SMS'
    };
  }
};

/**
 * Send SMS via Fast2SMS
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content
 * @param {string} scheduleTime - Optional schedule time
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise} - Result of SMS sending
 */
const sendSMSViaFast2SMS = async (phoneNumber, message, scheduleTime = null, retryCount = 0) => {
  try {
    // Clean phone number (remove any non-numeric characters)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Make sure it's a 10-digit number for Fast2SMS
    const formattedNumber = cleanNumber.length === 12 && cleanNumber.startsWith('91') 
      ? cleanNumber.substring(2) 
      : cleanNumber;
    
    if (formattedNumber.length !== 10) {
      console.error('Invalid phone number format for Fast2SMS');
      return { success: false, error: 'Invalid phone number format' };
    }

    const params = new URLSearchParams({
      authorization: fast2smsConfig.authorization,
      route: fast2smsConfig.route,
      message: message,
      numbers: formattedNumber,
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
          status: response.data.message[0],
          provider: 'fast2sms'
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
        return sendSMSViaFast2SMS(phoneNumber, message, scheduleTime, retryCount + 1);
      }
      
      // If all retries failed or error is not retryable, log the failure
      await logSmsFailure(phoneNumber, message, { 
        code: errorCode, 
        message: errorMessage,
        provider: 'fast2sms'
      }, null, null, null, null, scheduleTime);
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode
      };
    }
  } catch (error) {
    console.error('Failed to send SMS via Fast2SMS:', error);
    
    // Retry if network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      if (retryCount < fast2smsConfig.maxRetries) {
        console.log(`Network error. Retrying SMS (attempt ${retryCount + 1} of ${fast2smsConfig.maxRetries})...`);
        // Exponential backoff for network errors
        const backoffDelay = fast2smsConfig.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return sendSMSViaFast2SMS(phoneNumber, message, scheduleTime, retryCount + 1);
      }
    }
    
    // Log network errors after all retries
    await logSmsFailure(phoneNumber, message, {
      message: error.message,
      isNetworkError: true,
      provider: 'fast2sms'
    }, null, null, null, null, scheduleTime);
    
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
 * Process all pending notifications that are due
 * This should be called by a scheduler at regular intervals
 */
const processPendingNotifications = async () => {
  try {
    console.log('Processing pending notifications...');
    
    const now = new Date();
    
    // Find all porting requests with unsent notifications due before now
    const portingRequests = await PortingRequest.find({
      'notifications.sent': false,
      'notifications.scheduledFor': { $lte: now }
    });
    
    if (portingRequests.length === 0) {
      console.log('No pending notifications found');
      return { success: true, count: 0 };
    }
    
    console.log(`Found ${portingRequests.length} porting requests with pending notifications`);
    
    let notificationsSent = 0;
    let notificationsFailed = 0;
    
    // Process each request
    for (const request of portingRequests) {
      try {
        // Get user information for notifications
        const user = await User.findById(request.user);
        
        if (!user) {
          console.error(`User not found for porting request ${request._id}`);
          continue;
        }
        
        // Flag to check if request needs to be saved
        let needsSave = false;
        
        // Get unsent notifications that are due
        const pendingNotifications = request.notifications.filter(
          notification => !notification.sent && new Date(notification.scheduledFor) <= now
        );
        
        console.log(`Processing ${pendingNotifications.length} notifications for porting request ${request._id}`);
        
        // Process each notification
        for (const notification of pendingNotifications) {
          try {
            // Send based on notification type
            let result;
            
            switch (notification.type) {
              case 'sms':
                if (request.mobileNumber) {
                  // Send SMS
                  result = await sendSMS(request.mobileNumber, notification.message);
                  
                  // Record SMS ID if successful
                  if (result.success) {
                    notification.externalId = result.result.messageId;
                    notification.provider = result.result.provider || 'unknown';
                  }
                } else {
                  console.warn(`No mobile number found for porting request ${request._id}`);
                  result = { success: false, error: 'No mobile number available' };
                }
                break;
                
              case 'email':
                // If metadata has email or try user email
                const email = request.metadata?.email || user.email;
                if (email) {
                  // Send email
                  result = await sendEmail(
                    email,
                    `PortMySim: ${notification.message.substring(0, 50)}...`,
                    notification.message
                  );
                } else {
                  console.warn(`No email found for porting request ${request._id}`);
                  result = { success: false, error: 'No email available' };
                }
                break;
                
              case 'app':
                // Send app notification to user
                result = await sendAppNotification(
                  user._id,
                  'PortMySim Notification',
                  notification.message,
                  { portingRequestId: request._id.toString() }
                );
                break;
                
              default:
                console.warn(`Unknown notification type: ${notification.type}`);
                result = { success: false, error: 'Unknown notification type' };
            }
            
            // Update notification status
            notification.sent = result.success;
            notification.sentAt = new Date();
            notification.status = result.success ? 'sent' : 'failed';
            notification.error = result.success ? null : result.error;
            
            // Count successes and failures
            if (result.success) {
              notificationsSent++;
            } else {
              notificationsFailed++;
              
              // Log failures (except for app notifications which might just mean user doesn't have the app)
              if (notification.type !== 'app') {
                console.error(`Failed to send ${notification.type} notification:`, result.error);
              }
            }
            
            needsSave = true;
            
          } catch (notificationError) {
            console.error(`Error processing notification ${notification._id}:`, notificationError);
            
            // Update notification with error
            notification.status = 'failed';
            notification.error = notificationError.message;
            notificationsFailed++;
            
            needsSave = true;
          }
        }
        
        // Save the request if any notifications were processed
        if (needsSave) {
          await request.save();
        }
        
      } catch (requestError) {
        console.error(`Error processing notifications for request ${request._id}:`, requestError);
      }
    }
    
    console.log(`Notification processing complete. Sent: ${notificationsSent}, Failed: ${notificationsFailed}`);
    
    return {
      success: true,
      sent: notificationsSent,
      failed: notificationsFailed
    };
    
  } catch (error) {
    console.error('Error processing pending notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize notification processing scheduler
 * This should be called once when the server starts
 */
const initNotificationScheduler = () => {
  const intervalMinutes = parseInt(process.env.NOTIFICATION_INTERVAL_MINUTES || '5', 10);
  console.log(`Initializing notification scheduler to run every ${intervalMinutes} minutes`);
  
  // Run immediately on startup
  setTimeout(() => {
    processPendingNotifications().catch(err => {
      console.error('Error in scheduled notification processing:', err);
    });
  }, 10000); // Wait 10 seconds after server start
  
  // Set up the interval
  setInterval(() => {
    processPendingNotifications().catch(err => {
      console.error('Error in scheduled notification processing:', err);
    });
  }, intervalMinutes * 60 * 1000);
  
  return true;
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
 * Convert template variables to a formatted message
 * @param {string} template - The template string with placeholders
 * @param {Object} variables - Object containing variable values
 * @returns {string} - Formatted message
 */
const resolveTemplate = (template, variables) => {
  let result = template;
  
  // Replace each variable in the template
  for (const [key, value] of Object.entries(variables)) {
    // Support for multiple variable formats: #{var}, {var}, #var#
    result = result
      .replace(new RegExp(`#{${key}}`, 'g'), value)
      .replace(new RegExp(`{${key}}`, 'g'), value)
      .replace(new RegExp(`#${key}#`, 'g'), value);
  }
  
  return result;
};

/**
 * Send a templated SMS using available providers
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} templateId - ID of the template to use
 * @param {Object} variables - Variables to replace in the template
 * @param {string} scheduleTime - Optional schedule time (YYYY-MM-DD HH:mm:ss)
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise} - Result of SMS sending
 */
const sendTemplatedSMS = async (phoneNumber, templateId, variables, scheduleTime = null, retryCount = 0) => {
  try {
    // Find template by ID or name
    const templateKey = Object.keys(portingTemplates).find(key => 
      portingTemplates[key].id === templateId || key === templateId
    );
    
    if (!templateKey) {
      console.error(`Template not found: ${templateId}`);
      return { success: false, error: 'SMS template not found' };
    }
    
    const template = portingTemplates[templateKey];
    
    // Determine if this is an Indian number (for provider selection)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const isIndianNumber = cleanNumber.length === 10 || 
                          (cleanNumber.length === 12 && cleanNumber.startsWith('91'));
    
    let messageToSend;
    
    // For Indian numbers with Fast2SMS configured, use their template system if template ID exists
    if (isIndianNumber && process.env.FAST2SMS_API_KEY && template.id) {
      try {
        const params = new URLSearchParams({
          authorization: fast2smsConfig.authorization,
          route: fast2smsConfig.route,
          template_id: template.id,
          flash: fast2smsConfig.flash
        });
        
        // Add number
        params.append('numbers', cleanNumber.length === 12 ? cleanNumber.substring(2) : cleanNumber);
        
        // Add variables
        template.variables.forEach((varName, index) => {
          // Convert from template variable format (#var#) to actual value
          const key = varName.replace(/#/g, '');
          const value = variables[key];
          
          if (value) {
            params.append(`variable_${index + 1}`, value);
          } else {
            console.warn(`Missing variable value for ${varName} in template ${templateId}`);
            params.append(`variable_${index + 1}`, '-');
          }
        });
        
        // Add schedule_time if provided
        if (scheduleTime) {
          params.append('schedule_time', scheduleTime);
        }

        const response = await axios.get(`${fast2smsConfig.baseUrl}?${params.toString()}`);
        
        if (response.data.return === true) {
          console.log('Templated SMS sent successfully via Fast2SMS:', response.data);
          return { 
            success: true, 
            result: {
              messageId: response.data.request_id,
              status: response.data.message[0],
              provider: 'fast2sms',
              template: templateId
            }
          };
        } else {
          const errorCode = response.data.code || 'default';
          const errorMessage = fast2smsErrorMap[errorCode] || fast2smsErrorMap.default;
          
          console.error(`Fast2SMS templated SMS error (${errorCode}): ${errorMessage}`, response.data);
          
          // Fall back to regular SMS with resolved template
          console.log('Falling back to regular SMS with resolved template');
          
          // We need to create the message text ourselves from the template
          if (template.template) {
            messageToSend = resolveTemplate(template.template, variables);
          } else {
            // If no template text available, create a simple message with variables
            messageToSend = `Message from PortMySim: ${Object.values(variables).join(', ')}`;
          }
        }
      } catch (error) {
        console.error('Error sending templated SMS via Fast2SMS:', error);
        
        // Fall back to regular SMS with resolved template
        if (template.template) {
          messageToSend = resolveTemplate(template.template, variables);
        } else {
          // If no template text available, create a simple message with variables
          messageToSend = `Message from PortMySim: ${Object.values(variables).join(', ')}`;
        }
      }
    } else {
      // For non-Indian numbers or if no template ID is available, use regular SMS
      // Resolve the template text
      if (template.template) {
        messageToSend = resolveTemplate(template.template, variables);
      } else {
        // Create a default message from variables
        messageToSend = `PortMySim notification: ${JSON.stringify(variables)}`;
      }
    }
    
    // If we've resolved a message to send, use the regular SMS function
    if (messageToSend) {
      const result = await sendSMS(phoneNumber, messageToSend, scheduleTime, retryCount);
      
      // Add template information to the result
      if (result.success && result.result) {
        result.result.template = templateId;
      }
      
      return result;
    }
    
    // If we got here, something went wrong
    await logSmsFailure(
      phoneNumber, 
      'Template processing failed', 
      { templateId, variables }, 
      null, 
      null, 
      templateId, 
      variables, 
      scheduleTime
    );
    
    return { 
      success: false, 
      error: 'Failed to process template',
      templateId
    };
  } catch (error) {
    console.error('Error in sendTemplatedSMS:', error);
    
    // Log the failure
    await logSmsFailure(
      phoneNumber, 
      'Error in template processing', 
      {
        message: error.message,
        stack: error.stack
      }, 
      null, 
      null, 
      templateId, 
      variables, 
      scheduleTime
    );
    
    return { 
      success: false, 
      error: 'Error processing SMS template'
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

export {
  sendSMS,
  sendEmail,
  sendAppNotification,
  processPendingNotifications,
  prepareAutomatedSms,
  getPendingAutomatedSms,
  updateAutomatedSmsStatus,
  generateReminderMessage,
  scheduleReminders,
  cancelAllPendingNotifications,
  sendTemplatedSMS,
  sendPortingConfirmation,
  sendSmsReminder,
  sendCenterVisitReminder,
  sendDocumentsReminder,
  sendSimActivation,
  sendUpcReceived,
  initNotificationScheduler,
  resolveTemplate
}; 