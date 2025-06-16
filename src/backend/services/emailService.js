// Email Service
// Path: src/backend/services/emailService.js
// Purpose: Handle all email sending functionality

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For Gmail (requires app-specific password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App-specific password
      },
    });
  }
  
  // For SendGrid
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  // For development/testing with Mailtrap
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }
  
  // Default SMTP configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  passwordReset: (resetUrl, username) => ({
    subject: '🌸 Reset Your Wallflower Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #FAF8F6;
              border-radius: 10px;
              padding: 30px;
              text-align: center;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h2 {
              color: #937DC2;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #937DC2 0%, #E0AED0 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 999px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #777;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 10px;
              border-radius: 5px;
              margin-top: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🌸</div>
            <h2>Hi ${username},</h2>
            <p>We received a request to reset your Wallflower password.</p>
            <p>Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset My Password</a>
            
            <p style="margin-top: 20px; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <span style="color: #937DC2; word-break: break-all;">${resetUrl}</span>
            </p>
            
            <div class="warning">
              ⏰ This link will expire in 1 hour for security reasons.
            </div>
            
            <div class="footer">
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Your password won't be changed until you create a new one.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p>© 2024 Wallflower - Dating at your own pace 🌱</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${username},
      
      We received a request to reset your Wallflower password.
      
      Click this link to create a new password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      Your password won't be changed until you create a new one.
      
      © 2024 Wallflower - Dating at your own pace
    `
  }),
  
  welcome: (username) => ({
    subject: '🌸 Welcome to Wallflower!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #FAF8F6;
              border-radius: 10px;
              padding: 30px;
              text-align: center;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h2 {
              color: #937DC2;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #937DC2 0%, #E0AED0 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 999px;
              font-weight: bold;
              margin: 20px 0;
            }
            .tips {
              background-color: white;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            }
            .tip-item {
              margin: 10px 0;
              padding-left: 20px;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🌸</div>
            <h2>Welcome to Wallflower, ${username}!</h2>
            <p>You're now part of a gentle community where introverts bloom at their own pace.</p>
            
            <div class="tips">
              <h3 style="color: #937DC2;">Here's how to get started:</h3>
              <div class="tip-item">🌱 <strong>Complete your profile</strong> - Share what makes you unique</div>
              <div class="tip-item">📸 <strong>Add photos</strong> - Let others see the real you</div>
              <div class="tip-item">🌻 <strong>Browse gardens</strong> - Discover kindred spirits</div>
              <div class="tip-item">💌 <strong>Send seeds</strong> - Show interest gently</div>
            </div>
            
            <p>You've received <strong>5 free seeds</strong> to start making connections!</p>
            
            <a href="${process.env.CLIENT_URL}/profile" class="button">Complete My Profile</a>
            
            <div class="footer">
              <p>Take your time - there's no rush in our garden 🌿</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p>© 2024 Wallflower - Dating at your own pace</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to Wallflower, ${username}!
      
      You're now part of a gentle community where introverts bloom at their own pace.
      
      Here's how to get started:
      - Complete your profile - Share what makes you unique
      - Add photos - Let others see the real you
      - Browse gardens - Discover kindred spirits
      - Send seeds - Show interest gently
      
      You've received 5 free seeds to start making connections!
      
      Visit ${process.env.CLIENT_URL}/profile to complete your profile.
      
      Take your time - there's no rush in our garden
      
      © 2024 Wallflower - Dating at your own pace
    `
  })
};

// Main email sending function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    
    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Wallflower'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendPasswordResetEmail = async (email, resetUrl, username) => {
  const template = emailTemplates.passwordReset(resetUrl, username);
  return await sendEmail({
    to: email,
    ...template
  });
};

const sendWelcomeEmail = async (email, username) => {
  const template = emailTemplates.welcome(username);
  return await sendEmail({
    to: email,
    ...template
  });
};

// THIS IS THE CRUCIAL PART YOU'RE MISSING!
module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};