import mongoose from 'mongoose';

const SmsFailureLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Not all SMS might be tied to a user
  },
  portingRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortingRequest',
    required: false // Not all SMS might be tied to a porting request
  },
  phoneNumber: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  errorDetails: {
    code: String,
    message: String,
    isNetworkError: Boolean,
    rawError: Object
  },
  templateId: {
    type: String,
    required: false // Only for templated SMS
  },
  variables: {
    type: Object,
    required: false // Only for templated SMS
  },
  attemptCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'ignored'],
    default: 'pending'
  },
  scheduleTime: {
    type: Date,
    required: false
  },
  resolutionNote: {
    type: String,
    required: false
  },
  resolvedAt: {
    type: Date,
    required: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Indexes for performance
SmsFailureLogSchema.index({ userId: 1 });
SmsFailureLogSchema.index({ portingRequestId: 1 });
SmsFailureLogSchema.index({ status: 1 });
SmsFailureLogSchema.index({ createdAt: 1 });
SmsFailureLogSchema.index({ phoneNumber: 1 });

const SmsFailureLog = mongoose.model('SmsFailureLog', SmsFailureLogSchema);

export default SmsFailureLog; 