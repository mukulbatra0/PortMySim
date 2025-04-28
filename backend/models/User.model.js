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
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
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
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
      validate: {
        validator: function(v) {
          // Password must contain at least: one uppercase, one lowercase, one number
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
        },
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: true
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
    providerId: String,
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    accountLocked: {
      type: Boolean,
      default: false
    },
    accountLockedUntil: Date,
    lastPasswordChange: Date,
    passwordHistory: {
      type: [String],
      select: false,
      default: []
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      select: false
    }
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
    // Store the old password in history (if it exists)
    if (this.password && this.isModified('password') && !this.isNew) {
      // Limit history to 5 most recent passwords
      if (!this.passwordHistory) this.passwordHistory = [];
      
      const currentPassword = await this.constructor.findById(this._id)
        .select('password')
        .then(user => user ? user.password : null);
        
      if (currentPassword) {
        if (this.passwordHistory.length >= 5) {
          this.passwordHistory.shift(); // Remove oldest password
        }
        this.passwordHistory.push(currentPassword);
      }
      
      // Update the password change timestamp
      this.lastPasswordChange = Date.now();
    }
    
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

// Check if password matches any of the previous passwords
userSchema.methods.isPasswordReused = async function (newPassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) {
    return false;
  }
  
  // Check against each password in history
  for (const oldPassword of this.passwordHistory) {
    if (await bcrypt.compare(newPassword, oldPassword)) {
      return true;
    }
  }
  
  return false;
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  // Make sure JWT_SECRET is not empty, use fallback if needed
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only';
  const expiry = process.env.JWT_EXPIRE || '30d';
  
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET environment variable is not set. Using fallback secret for development.');
  }
  
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email,
      version: this.lastPasswordChange ? this.lastPasswordChange.getTime() : Date.now()
    },
    secret,
    { expiresIn: expiry }
  );
};

// Increment failed login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // Update login attempts
  this.failedLoginAttempts += 1;
  
  // Lock account if too many failed attempts (5)
  if (this.failedLoginAttempts >= 5) {
    this.accountLocked = true;
    this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    console.log(`Account locked for user: ${this.email} until ${this.accountLockedUntil}`);
  }
  
  await this.save({ validateBeforeSave: false });
  
  return this.accountLocked;
};

// Reset failed login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.accountLocked = false;
  this.accountLockedUntil = undefined;
  
  await this.save({ validateBeforeSave: false });
  
  return true;
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');

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
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire time to 24 hours
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  if (!this.accountLocked) return false;
  
  // Check if lock time has expired
  if (this.accountLockedUntil && this.accountLockedUntil < new Date()) {
    // Lock has expired, but we haven't updated the document yet
    return false;
  }
  
  return this.accountLocked;
});

// Add virtual property for remaining lock time
userSchema.virtual('lockTimeRemaining').get(function() {
  if (!this.accountLocked || !this.accountLockedUntil) return 0;
  
  const remainingTime = this.accountLockedUntil - new Date();
  return remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0; // In seconds
});

const User = mongoose.model('User', userSchema);

export default User; 