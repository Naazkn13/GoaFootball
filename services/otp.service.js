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

    const baseTemplate = (title, message, color) => `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; text-align: center; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #1a1a1a; margin-bottom: 10px; font-size: 24px;">${title}</h2>
        <p style="color: #555555; font-size: 16px; margin-bottom: 25px; line-height: 1.5;">${message}</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 0 auto 25px auto; max-width: 300px; border: 1px dashed #d1d5db;">
          <h1 style="color: ${color}; font-size: 42px; letter-spacing: 12px; margin: 0; font-weight: 700;">${otp}</h1>
        </div>
        <p style="color: #888888; font-size: 14px; margin-bottom: 30px;">This security code will expire in <strong>5 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="color: #aaaaaa; font-size: 12px; line-height: 1.4;">If you didn't request this code, please ignore this email or secure your account.<br/>&copy; ${new Date().getFullYear()} Goa Football Festival</p>
      </div>
    `;

    const emailTemplates = {
      signup: {
        subject: 'Goa Football Festival - Verify Your Email',
        body: baseTemplate('Welcome to Goa Football Festival!', 'We are excited to have you on board. Please use the verification code below to complete your registration:', '#10b981')
      },
      login: {
        subject: 'Goa Football Festival - Login Verification',
        body: baseTemplate('Login Verification', 'Please enter the code below to securely access your account:', '#3b82f6')
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
