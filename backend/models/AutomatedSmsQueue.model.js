import mongoose from 'mongoose';

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
  },
  portingRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortingRequest'
  }
});

// Index for faster queries
automatedSmsQueueSchema.index({ user: 1, status: 1 });

const AutomatedSmsQueue = mongoose.model('AutomatedSmsQueue', automatedSmsQueueSchema);

export default AutomatedSmsQueue; 