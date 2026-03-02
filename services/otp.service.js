// OTP Service - Generate and send OTP via email
import crypto from 'crypto';
import emailService from './email.service.js';

class OTPService {
  // Generate 4-digit OTP using cryptographically secure random
  generateOTP() {
    return crypto.randomInt(1000, 10000).toString();
  }

  // Send OTP via email (placeholder for email service)
  async sendOTPEmail(email, otp, purpose) {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // For now, return the email configuration

    const emailTemplates = {
      signup: {
        subject: 'Football App - Verify Your Email',
        body: `
          <h2>Welcome to Football App!</h2>
          <p>Your OTP for email verification is:</p>
          <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      },
      login: {
        subject: 'Football App - Login OTP',
        body: `
          <h2>Login Verification</h2>
          <p>Your OTP for login is:</p>
          <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please secure your account immediately.</p>
        `,
      },
    };

    const template = emailTemplates[purpose] || emailTemplates.login;

    // Email configuration object (to be used with email service)
    const emailConfig = {
      to: email,
      subject: template.subject,
      html: template.body,
      from: process.env.EMAIL_FROM || 'noreply@footballapp.com',
    };



    // Send email via email service
    try {
      await emailService.send(emailConfig);
      console.log('✅ OTP email sent successfully');
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      throw new Error('Failed to send OTP email');
    }

    return emailConfig;
  }
}

export default new OTPService();
