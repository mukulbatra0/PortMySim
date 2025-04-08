import { getPendingAutomatedSms, updateAutomatedSmsStatus } from '../utils/notificationService.js';
import AutomatedSmsQueue from '../models/AutomatedSmsQueue.model.js';
import PortingRequest from '../models/PortingRequest.model.js';

/**
 * @desc    Get pending automated SMS for mobile app to send
 * @route   GET /api/mobile-sms/pending
 * @access  Private
 */
const getPendingSms = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await getPendingAutomatedSms(userId);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error getting pending SMS for mobile app:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update SMS status from mobile app
 * @route   PUT /api/mobile-sms/:smsId
 * @access  Private
 */
const updateSmsStatus = async (req, res) => {
  try {
    const { smsId } = req.params;
    const { success, error } = req.body;
    
    // Validate input
    if (typeof success !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'success must be a boolean value'
      });
    }
    
    // Check if the SMS belongs to this user
    const sms = await AutomatedSmsQueue.findById(smsId);
    if (!sms) {
      return res.status(404).json({
        success: false,
        error: 'SMS not found'
      });
    }
    
    if (sms.user.toString() !== req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this SMS'
      });
    }
    
    // Update the SMS status
    const result = await updateAutomatedSmsStatus(smsId, success, error);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
    // If SMS was sent successfully and it's a UPC request, update the porting request
    if (success && sms.targetNumber === '1900' && sms.message === 'PORT') {
      // Find the associated porting request
      const portingRequest = await PortingRequest.findOne({
        user: req.userId,
        automatePorting: true,
        smsDate: { $lte: new Date() }
      }).sort({ smsDate: -1 });
      
      if (portingRequest) {
        // Update the status history to indicate SMS was sent
        portingRequest.statusHistory.push({
          status: portingRequest.status,
          timestamp: new Date(),
          notes: 'Automated PORT SMS sent to 1900'
        });
        
        await portingRequest.save();
      }
    }
    
    return res.status(200).json({
      success: true,
      message: success ? 'SMS sent successfully' : 'SMS sending failed'
    });
  } catch (error) {
    console.error('Error updating SMS status from mobile app:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export default {
  getPendingSms,
  updateSmsStatus
}; 