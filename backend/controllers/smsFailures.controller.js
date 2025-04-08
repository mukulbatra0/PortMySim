import SmsFailureLog from '../models/SmsFailureLog.model.js';
import { sendSMS, sendTemplatedSMS } from '../utils/notificationService.js';

/**
 * @desc    Get all SMS failures with pagination and filtering
 * @route   GET /api/sms-failures
 * @access  Admin
 */
const getSmsFailures = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter from query params
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.phoneNumber) {
      filter.phoneNumber = { $regex: req.query.phoneNumber, $options: 'i' };
    }
    
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    if (req.query.fromDate && req.query.toDate) {
      filter.createdAt = { 
        $gte: new Date(req.query.fromDate), 
        $lte: new Date(req.query.toDate) 
      };
    }
    
    // Get total count for pagination
    const total = await SmsFailureLog.countDocuments(filter);
    
    // Get failures with pagination
    const failures = await SmsFailureLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phoneNumber')
      .populate('portingRequestId', 'mobileNumber currentProvider newProvider')
      .populate('resolvedBy', 'name email');
    
    return res.status(200).json({
      success: true,
      count: failures.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: failures
    });
  } catch (error) {
    console.error('Error getting SMS failures:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get a single SMS failure by ID
 * @route   GET /api/sms-failures/:id
 * @access  Admin
 */
const getSmsFailure = async (req, res) => {
  try {
    const failure = await SmsFailureLog.findById(req.params.id)
      .populate('userId', 'name email phoneNumber')
      .populate('portingRequestId', 'mobileNumber currentProvider newProvider')
      .populate('resolvedBy', 'name email');
    
    if (!failure) {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: failure
    });
  } catch (error) {
    console.error('Error getting SMS failure:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Retry sending a failed SMS
 * @route   POST /api/sms-failures/:id/retry
 * @access  Admin
 */
const retrySmsFailure = async (req, res) => {
  try {
    const failure = await SmsFailureLog.findById(req.params.id);
    
    if (!failure) {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    let result;
    
    // Check if it's a template SMS or regular SMS
    if (failure.templateId) {
      result = await sendTemplatedSMS(
        failure.phoneNumber,
        failure.templateId,
        failure.variables,
        failure.scheduleTime
      );
    } else {
      result = await sendSMS(
        failure.phoneNumber,
        failure.message,
        failure.scheduleTime
      );
    }
    
    if (result.success) {
      // Update the failure record
      failure.status = 'resolved';
      failure.resolvedAt = new Date();
      failure.resolvedBy = req.userId;
      failure.resolutionNote = 'Retried successfully';
      failure.attemptCount += 1;
      
      await failure.save();
      
      return res.status(200).json({
        success: true,
        message: 'SMS resent successfully',
        data: result.result
      });
    } else {
      // Update attempt count
      failure.attemptCount += 1;
      await failure.save();
      
      return res.status(400).json({
        success: false,
        error: 'Failed to resend SMS',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Error retrying SMS failure:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update SMS failure status
 * @route   PUT /api/sms-failures/:id
 * @access  Admin
 */
const updateSmsFailure = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    
    if (!status || !['resolved', 'ignored', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: resolved, ignored, pending'
      });
    }
    
    const failure = await SmsFailureLog.findById(req.params.id);
    
    if (!failure) {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    // Update the failure
    failure.status = status;
    failure.resolutionNote = resolutionNote || failure.resolutionNote;
    
    if (status === 'resolved' || status === 'ignored') {
      failure.resolvedAt = new Date();
      failure.resolvedBy = req.userId;
    } else {
      // If changing back to pending, clear resolution fields
      failure.resolvedAt = null;
      failure.resolvedBy = null;
    }
    
    await failure.save();
    
    return res.status(200).json({
      success: true,
      message: 'SMS failure updated successfully',
      data: failure
    });
  } catch (error) {
    console.error('Error updating SMS failure:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Delete an SMS failure
 * @route   DELETE /api/sms-failures/:id
 * @access  Admin
 */
const deleteSmsFailure = async (req, res) => {
  try {
    const failure = await SmsFailureLog.findById(req.params.id);
    
    if (!failure) {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    await failure.remove();
    
    return res.status(200).json({
      success: true,
      message: 'SMS failure deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SMS failure:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'SMS failure not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export {
  getSmsFailures,
  getSmsFailure,
  retrySmsFailure,
  updateSmsFailure,
  deleteSmsFailure
}; 