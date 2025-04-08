import mongoose from 'mongoose';

// FAQ Schema
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please add a question'],
      trim: true
    },
    answer: {
      type: String,
      required: [true, 'Please add an answer'],
      trim: true
    },
    category: {
      type: String,
      enum: ['general', 'porting', 'billing', 'plans', 'technical'],
      default: 'general'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ; 