import nodemailer from 'nodemailer';

/**
 * Email Service Class
 * Handles all email sending functionality for the application
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email', // Default to ethereal for testing
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Verify connection configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter.verify((error) => {
        if (error) {
          console.error('SMTP connection error:', error);
        } else {
          console.log('Email server is ready to send messages');
        }
      });
    } else {
      console.warn('Email credentials not set in environment variables. Email sending will be simulated.');
    }
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @returns {Promise} - Send mail result
   */
  async sendEmail(options) {
    try {
      // Check if email sending is disabled
      if (process.env.DISABLE_EMAIL_SENDING === 'true') {
        console.log('Email sending is disabled. Would have sent:');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        
        // Return mock successful response
        return {
          messageId: 'mock-message-id',
          response: 'Email sending bypassed in development mode'
        };
      }

      // Create mail options
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"PortMySim" <no-reply@portmysim.com>',
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      
      // If using ethereal, log preview URL
      if (process.env.NODE_ENV === 'development' && process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send verification email
   * @param {Object} options - Verification options
   * @returns {Promise} - Send mail result
   */
  async sendVerificationEmail(options) {
    const { email, name, verificationUrl } = options;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://portmysim.com/logo.png" alt="PortMySim Logo" style="max-width: 150px;" />
        </div>
        <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #666; line-height: 1.5;">Thank you for registering with PortMySim. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #666; line-height: 1.5;">If you did not create an account, no further action is required.</p>
          <p style="color: #666; line-height: 1.5;">This verification link will expire in 24 hours.</p>
        </div>
        <div style="color: #999; font-size: 12px; text-align: center;">
          <p>&copy; ${new Date().getFullYear()} PortMySim. All rights reserved.</p>
          <p>If you have any questions, please contact our support team at support@portmysim.com</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'PortMySim Email Verification',
      html
    });
  }

  /**
   * Send password reset email
   * @param {Object} options - Reset options
   * @returns {Promise} - Send mail result
   */
  async sendPasswordResetEmail(options) {
    const { email, name, resetUrl } = options;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://portmysim.com/logo.png" alt="PortMySim Logo" style="max-width: 150px;" />
        </div>
        <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #666; line-height: 1.5;">You are receiving this email because you (or someone else) has requested the reset of your account password. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; line-height: 1.5;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p style="color: #666; line-height: 1.5;">This password reset link will expire in 10 minutes.</p>
        </div>
        <div style="color: #999; font-size: 12px; text-align: center;">
          <p>&copy; ${new Date().getFullYear()} PortMySim. All rights reserved.</p>
          <p>If you have any questions, please contact our support team at support@portmysim.com</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'PortMySim Password Reset',
      html
    });
  }

  /**
   * Send welcome email after successful verification
   * @param {Object} options - Welcome options
   * @returns {Promise} - Send mail result
   */
  async sendWelcomeEmail(options) {
    const { email, name } = options;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://portmysim.com/logo.png" alt="PortMySim Logo" style="max-width: 150px;" />
        </div>
        <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Welcome to PortMySim!</h2>
          <p style="color: #666; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #666; line-height: 1.5;">Thank you for verifying your email address. Your account is now fully activated!</p>
          <p style="color: #666; line-height: 1.5;">With PortMySim, you can easily:</p>
          <ul style="color: #666; line-height: 1.5;">
            <li>Compare plans across all major telecom providers</li>
            <li>Schedule and track your mobile number porting process</li>
            <li>Get customized recommendations based on your usage</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://portmysim.com/login" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
          </div>
        </div>
        <div style="color: #999; font-size: 12px; text-align: center;">
          <p>&copy; ${new Date().getFullYear()} PortMySim. All rights reserved.</p>
          <p>If you have any questions, please contact our support team at support@portmysim.com</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to PortMySim!',
      html
    });
  }

  /**
   * Send password change notification email
   * @param {Object} options - Notification options
   * @returns {Promise} - Send mail result
   */
  async sendPasswordChangeNotification(options) {
    const { email, name } = options;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://portmysim.com/logo.png" alt="PortMySim Logo" style="max-width: 150px;" />
        </div>
        <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Password Changed</h2>
          <p style="color: #666; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #666; line-height: 1.5;">Your PortMySim account password was recently changed. If you made this change, you can safely ignore this email.</p>
          <p style="color: #666; line-height: 1.5;">If you did not change your password, please secure your account immediately:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://portmysim.com/forgot-password" style="background-color: #ED4245; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Your Password</a>
          </div>
          <p style="color: #666; line-height: 1.5;">For security, you may be asked to verify your identity when signing in from a new device or browser.</p>
        </div>
        <div style="color: #999; font-size: 12px; text-align: center;">
          <p>&copy; ${new Date().getFullYear()} PortMySim. All rights reserved.</p>
          <p>If you have any questions, please contact our support team at support@portmysim.com</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'PortMySim Password Changed - Action Notice',
      html
    });
  }

  /**
   * Send account locked notification email
   * @param {Object} options - Notification options
   * @returns {Promise} - Send mail result
   */
  async sendAccountLockedEmail(options) {
    const { email, name, unlockTime } = options;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://portmysim.com/logo.png" alt="PortMySim Logo" style="max-width: 150px;" />
        </div>
        <div style="background-color: #f9f9f9; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Account Temporarily Locked</h2>
          <p style="color: #666; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #666; line-height: 1.5;">Your PortMySim account has been temporarily locked after multiple failed login attempts.</p>
          <p style="color: #666; line-height: 1.5;">For your security, the account will be locked until: <strong>${new Date(unlockTime).toLocaleString()}</strong></p>
          <p style="color: #666; line-height: 1.5;">If this was not you, someone may be attempting to access your account. We recommend updating your password after the account unlocks.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://portmysim.com/forgot-password" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
        </div>
        <div style="color: #999; font-size: 12px; text-align: center;">
          <p>&copy; ${new Date().getFullYear()} PortMySim. All rights reserved.</p>
          <p>If you have any questions, please contact our support team at support@portmysim.com</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'PortMySim Account Temporarily Locked',
      html
    });
  }
}

// Export a singleton instance
export default new EmailService(); 