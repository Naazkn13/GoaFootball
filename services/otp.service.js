// OTP Service - Generate and send OTP via email
import crypto from 'crypto';
import emailService from './email.service.js';

class OTPService {
  // Generate 4-digit OTP
  generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Store OTP in database with expiry (5 minutes)
  async storeOTP(email, otp, purpose = 'login') {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    // SQL Query to store OTP
    const query = `
      INSERT INTO otps (email, otp, purpose, expires_at, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (email, purpose) 
      DO UPDATE SET 
        otp = $2,
        expires_at = $4,
        created_at = NOW(),
        is_verified = false,
        attempts = 0
      RETURNING id;
    `;
    
    return { query, params: [email, otp, purpose, expiresAt] };
  }

  // Verify OTP
  async verifyOTP(email, otp, purpose = 'login') {
    // SQL Query to verify OTP
    const query = `
      UPDATE otps 
      SET is_verified = true, verified_at = NOW()
      WHERE email = $1 
        AND otp = $2 
        AND purpose = $3
        AND is_verified = false
        AND expires_at > NOW()
        AND attempts < 3
      RETURNING id, email;
    `;
    
    return { query, params: [email, otp, purpose] };
  }

  // Increment failed attempts
  async incrementAttempts(email, purpose) {
    const query = `
      UPDATE otps 
      SET attempts = attempts + 1
      WHERE email = $1 AND purpose = $2 AND is_verified = false
      RETURNING attempts;
    `;
    
    return { query, params: [email, purpose] };
  }

  // Delete old OTPs (cleanup)
  async cleanupExpiredOTPs() {
    const query = `
      DELETE FROM otps 
      WHERE expires_at < NOW() OR created_at < NOW() - INTERVAL '1 day';
    `;
    
    return { query, params: [] };
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

    console.log(`📧 Sending OTP Email to ${email}: ${otp}`);
    console.log('Email Config:', JSON.stringify(emailConfig, null, 2));

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
