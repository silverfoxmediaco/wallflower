// Contact Routes
// Path: src/backend/routes/contactRoutes.js
// Purpose: Handle contact form submissions

const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }
    
    // Send email to support team
    const supportEmailResult = await sendEmail({
      to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
      subject: `[Wallflower Contact] ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Submitted on ${new Date().toLocaleString()}</small></p>
      `,
      text: `New Contact Form Submission\n\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSubmitted on ${new Date().toLocaleString()}`
    });
    
    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: email,
      subject: 'We received your message - Wallflower',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #937DC2;">Hi ${name},</h2>
          <p>Thank you for reaching out to Wallflower! We've received your message and will get back to you within 24-48 hours.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>In the meantime, you might find helpful information in our:</p>
          <ul>
            <li><a href="${process.env.CLIENT_URL}/faq" style="color: #937DC2;">Frequently Asked Questions</a></li>
            <li><a href="${process.env.CLIENT_URL}/community-guidelines" style="color: #937DC2;">Community Guidelines</a></li>
            <li><a href="${process.env.CLIENT_URL}/safety" style="color: #937DC2;">Safety Tips</a></li>
          </ul>
          
          <p>Warm regards,<br>The Wallflower Team</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated response to confirm we received your message. Please do not reply to this email.</p>
        </div>
      `,
      text: `Hi ${name},\n\nThank you for reaching out to Wallflower! We've received your message and will get back to you within 24-48 hours.\n\nYour Message:\nSubject: ${subject}\nMessage:\n${message}\n\nIn the meantime, you might find helpful information in our:\n- Frequently Asked Questions: ${process.env.CLIENT_URL}/faq\n- Community Guidelines: ${process.env.CLIENT_URL}/community-guidelines\n- Safety Tips: ${process.env.CLIENT_URL}/safety\n\nWarm regards,\nThe Wallflower Team\n\nThis is an automated response to confirm we received your message. Please do not reply to this email.`
    });
    
    // Check if both emails were sent successfully
    if (!supportEmailResult.success || !userEmailResult.success) {
      throw new Error('Failed to send one or more emails');
    }
    
    // Optionally, save to database for tracking
    // const Contact = require('../models/Contact');
    // await Contact.create({
    //   name,
    //   email,
    //   subject,
    //   message,
    //   status: 'new',
    //   submittedAt: new Date()
    // });
    
    res.json({
      success: true,
      message: 'Your message has been sent successfully!'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// GET /api/contact/subjects - Get available contact subjects
router.get('/subjects', (req, res) => {
  res.json({
    success: true,
    subjects: [
      'General Inquiry',
      'Technical Support',
      'Account Issue',
      'Safety Concern',
      'Feature Request',
      'Bug Report',
      'Other'
    ]
  });
});

module.exports = router;