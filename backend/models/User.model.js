import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      unique: true,
      validate: {
        validator: function(v) {
          // Remove all non-digit characters (spaces, dashes, etc.)
          const digitsOnly = v.replace(/\D/g, '');
          // Check if the result is exactly 10 digits
          return digitsOnly.length === 10;
        },
        message: 'Please add a valid 10-digit phone number'
      },
      set: function(v) {
        // Remove all non-digit characters when saving to database
        return v ? v.replace(/\D/g, '') : v;
      }
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    active: {
      type: Boolean,
      default: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    providerId: String
  },
  {
    timestamps: true
  }
);

// Password encryption middleware
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  // Make sure JWT_SECRET is not empty, use fallback if needed
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only';
  const expiry = process.env.JWT_EXPIRE || '30d';
  
  console.log('Generating JWT with secret:', secret ? 'Secret available' : 'SECRET MISSING');
  
  return jwt.sign(
    { id: this._id, role: this.role },
    secret,
    { expiresIn: expiry }
  );
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate Email Verification Token
userSchema.methods.getEmailVerificationToken = function () {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire time to 24 hours
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

const User = mongoose.model('User', userSchema);

export default User; 