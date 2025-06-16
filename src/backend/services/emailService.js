// Email Service
// Path: src/backend/services/emailService.js
// Purpose: Handle all email sending functionality

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For Gmail (requires app-specific password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({  // Changed from createTransporter to createTransport
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App-specific password
      },
    });
  }
  
  // For SendGrid
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({  // Changed here too
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
    return nodemailer.createTransport({  // And here
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }
  
  // Default SMTP configuration
  return nodemailer.createTransport({  // And here
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};