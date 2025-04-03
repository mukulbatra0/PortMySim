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
      required: [true, 'Please add your phone number'],
      // Looser validation to allow international formats
      match: [
        /^[0-9+\-\s()]{10,15}$/,
        'Please add a valid phone number'
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
      type: String,
      default: ''
    },
    responseDate: {
      type: Date,
      default: null
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Update mongoose model to ensure it's properly created
let Contact;
try {
  // Try to get existing model first to avoid overwriting
  Contact = mongoose.model('Contact');
} catch (error) {
  // Model doesn't exist yet, create it
  Contact = mongoose.model('Contact', contactSchema);
}

module.exports = Contact; 