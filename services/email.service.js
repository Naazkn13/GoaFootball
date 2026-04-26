// Email Service - Placeholder for email integration
class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console'; // 'sendgrid', 'aws-ses', 'nodemailer'
  }

  // Send email
  async send(emailConfig) {
    const { to, subject, html, from } = emailConfig;

    // Placeholder for different email providers
    switch (this.provider) {
      case 'sendgrid':
        return this.sendWithSendGrid(emailConfig);

      case 'aws-ses':
        return this.sendWithAWSSES(emailConfig);

      case 'nodemailer':
        return this.sendWithNodemailer(emailConfig);

      default:
        return this.sendToConsole(emailConfig);
    }
  }

  // SendGrid integration (placeholder)
  async sendWithSendGrid(emailConfig) {
    // TODO: Implement SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailConfig);

    console.log('Would send via SendGrid');
    return { success: true, provider: 'sendgrid' };
  }

  // AWS SES integration (placeholder)
  async sendWithAWSSES(emailConfig) {
    // TODO: Implement AWS SES
    // const AWS = require('aws-sdk');
    // const ses = new AWS.SES({ region: process.env.AWS_REGION });

    console.log('Would send via AWS SES');
    return { success: true, provider: 'aws-ses' };
  }

  // Nodemailer integration
  async sendWithNodemailer(emailConfig) {
    try {
      const nodemailer = require('nodemailer');

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // Send email
      const info = await transporter.sendMail({
        from: emailConfig.from || process.env.EMAIL_FROM,
        to: emailConfig.to,
        subject: emailConfig.subject,
        html: emailConfig.html,
      });

      console.log('✅ Email sent successfully via Nodemailer');
      console.log('Message ID:', info.messageId);

      return { success: true, provider: 'nodemailer', messageId: info.messageId };
    } catch (error) {
      console.error('❌ Nodemailer error:', error.message);
      throw error;
    }
  }

  // Console logging (development)
  sendToConsole(emailConfig) {
    console.log('Email logged to console (development mode)');
    return { success: true, provider: 'console' };
  }

  // Helper to send status notifications
  async sendStatusUpdateEmail(user, club, action, reason = '') {
    // Determine subject and descriptive action
    let actionDesc = '';
    let subject = '';
    let color = '#1a56db';

    switch (action) {
      case 'approve':
        actionDesc = 'Approved';
        subject = 'Registration Approved - National Sports Academy';
        color = '#16a34a';
        break;
      case 'reject':
        actionDesc = 'Rejected';
        subject = 'Registration Rejected - National Sports Academy';
        color = '#dc2626';
        break;
      case 'hold':
        actionDesc = 'Placed on Hold';
        subject = 'Registration on Hold - National Sports Academy';
        color = '#f59e0b';
        break;
      case 'inactive':
        actionDesc = 'Marked as Inactive';
        subject = 'Profile Marked Inactive - National Sports Academy';
        color = '#dc2626';
        break;
      case 'active':
        actionDesc = 'Re-activated';
        subject = 'Profile Re-activated - National Sports Academy';
        color = '#16a34a';
        break;
      default:
        actionDesc = 'Updated';
        subject = 'Registration Status Updated - National Sports Academy';
    }

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Registration Status Update</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>The registration status for the following entity has been updated by the administration:</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> <span style="text-transform: capitalize;">${user.role || 'Player'}</span></p>
            ${user.football_id ? `<p style="margin: 5px 0;"><strong>Football ID:</strong> ${user.football_id}</p>` : ''}
            <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="font-weight: bold; color: ${color};">${actionDesc}</span></p>
            ${reason ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;"><strong>Admin Notes/Reason:</strong><br/> <i style="color: #475569;">${reason}</i></div>` : ''}
          </div>

          <p>If you have any questions regarding this decision, please log in to your dashboard and use the communication module to contact support.</p>
          <p>Thank you,<br/>National Sports Academy Team</p>
        </div>
      </div>
    `;

    const recipients = [user.email];
    if (club && club.email) {
      recipients.push(club.email);
    }

    // Send completely separate emails for better deliverability and privacy mapping
    const promises = recipients.filter(Boolean).map(email => 
      this.send({
        to: email,
        subject: subject,
        html: htmlTemplate
      })
    );

    try {
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Failed to send status email:', error);
      // We don't want to throw and break API workflows
      return { success: false, error };
    }
  }

  async sendTransferEmail(user, oldClub, newClub) {
    const subject = 'Club Transfer Notification - National Sports Academy';
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1d4ed8; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Official Club Transfer</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>This is an official notification that a club transfer has been processed by the central administration.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Player Name:</strong> ${user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}</p>
            ${user.football_id ? `<p style="margin: 5px 0;"><strong>Football ID:</strong> ${user.football_id}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Previous Club:</strong> ${oldClub ? oldClub.name : 'None / Independent'}</p>
            <p style="margin: 5px 0;"><strong>New Club:</strong> <span style="font-weight: bold; color: #16a34a;">${newClub ? newClub.name : 'None'}</span></p>
          </div>

          <p>If you have any concerns regarding this automated administrative transfer, please contact the support team immediately.</p>
          <p>Thank you,<br/>National Sports Academy</p>
        </div>
      </div>
    `;

    const recipients = [user.email, newClub?.email, oldClub?.email].filter(Boolean);
    const promises = recipients.map(email => 
      this.send({
        to: email,
        subject: subject,
        html: htmlTemplate
      })
    );

    try {
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Failed to send transfer email:', error);
      return { success: false, error };
    }
  }

  async sendUserUpdateEmail(user, currentClub) {
    const subject = 'Profile Details Updated - National Sports Academy';
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Profile Administration Update</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>Your profile details have been explicitly updated by the central administration team.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}</p>
            ${user.football_id ? `<p style="margin: 5px 0;"><strong>Football ID:</strong> ${user.football_id}</p>` : ''}
          </div>

          <p>Please log into your dashboard to review your current profile details. If any information appears incorrect, you may update it directly or contact support.</p>
          <p>Thank you,<br/>National Sports Academy Team</p>
        </div>
      </div>
    `;

    const recipients = [user.email, currentClub?.email].filter(Boolean);
    const promises = recipients.map(email => 
      this.send({
        to: email,
        subject: subject,
        html: htmlTemplate
      })
    );

    try {
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Failed to send user update email:', error);
      return { success: false, error };
    }
  }

  async sendGenericEmail(toEmail, subject, text, fromEmail = null) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">National Sports Academy</h2>
        </div>
        <div style="padding: 20px; white-space: pre-wrap;">
${text}
        </div>
      </div>
    `;

    try {
      await this.send({
        to: toEmail,
        subject: subject,
        html: htmlTemplate,
        from: fromEmail
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send generic email:', error);
      return { success: false, error };
    }
  }
}

export default new EmailService();
