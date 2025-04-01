const mongoose = require('mongoose');

// Contact Form Schema
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add your email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      match: [
        /^[6-9]\d{9}$/,
        'Please add a valid 10-digit phone number'
      ]
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Please add your message'],
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new'
    },
    responseMessage: {
      type: String
    },
    responseDate: {
      type: Date
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 