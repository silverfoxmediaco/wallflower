// Email Notification Service
// Path: src/backend/services/notificationService.js
// Purpose: Handle all email notifications for Wallflower

const { sendEmail } = require('./emailService');
const User = require('../models/User');

// Email templates for notifications
const notificationTemplates = {
  // 1. Seed received notification
  seedReceived: (senderName, recipientName) => ({
    subject: '🌱 Someone sent you a seed on Wallflower!',
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
            .sender-info {
              background-color: white;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
            .unsubscribe {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🌱</div>
            <h2>Hi ${recipientName},</h2>
            <p>Great news! You've received a seed from someone interested in getting to know you.</p>
            
            <div class="sender-info">
              <h3 style="color: #937DC2; margin-top: 0;">${senderName} sent you a seed!</h3>
              <p>They think you might be a great match. Why not check out their profile and see if you'd like to send a seed back?</p>
            </div>
            
            <p>When you both exchange seeds, you'll match and can start chatting!</p>
            
            <a href="${process.env.CLIENT_URL}/garden" class="button">View Your Garden</a>
            
            <div class="footer">
              <p>Happy growing! 🌸</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p>© 2024 Wallflower - Dating at your own pace</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #999;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${recipientName},
      
      Great news! You've received a seed from someone interested in getting to know you.
      
      ${senderName} sent you a seed!
      
      They think you might be a great match. Why not check out their profile and see if you'd like to send a seed back?
      
      When you both exchange seeds, you'll match and can start chatting!
      
      View your garden at: ${process.env.CLIENT_URL}/garden
      
      Happy growing!
      
      © 2024 Wallflower - Dating at your own pace
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  }),

  // 2. New message notification
  newMessage: (senderName, recipientName, messagePreview) => ({
    subject: `💬 New message from ${senderName}`,
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
            .message-preview {
              background-color: white;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }
            .sender-name {
              color: #937DC2;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .message-text {
              color: #666;
              font-style: italic;
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
            .unsubscribe {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💬</div>
            <h2>Hi ${recipientName},</h2>
            <p>You have a new message waiting for you!</p>
            
            <div class="message-preview">
              <div class="sender-name">${senderName}</div>
              <div class="message-text">"${messagePreview}"</div>
            </div>
            
            <p>Continue your conversation and nurture this connection.</p>
            
            <a href="${process.env.CLIENT_URL}/messages" class="button">Read Message</a>
            
            <div class="footer">
              <p>Keep the conversation blooming! 🌺</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p>© 2024 Wallflower - Dating at your own pace</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #999;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${recipientName},
      
      You have a new message waiting for you!
      
      ${senderName}: "${messagePreview}"
      
      Continue your conversation and nurture this connection.
      
      Read your message at: ${process.env.CLIENT_URL}/messages
      
      Keep the conversation blooming!
      
      © 2024 Wallflower - Dating at your own pace
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  }),

  // 3. Mutual seeds (match) notification
  mutualSeeds: (matchName, recipientName) => ({
    subject: '🌸 You have a new match on Wallflower!',
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
              font-size: 72px;
              margin-bottom: 20px;
              animation: bloom 2s ease-in-out infinite;
            }
            @keyframes bloom {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            h2 {
              color: #937DC2;
              margin-bottom: 20px;
              font-size: 28px;
            }
            .match-info {
              background-color: white;
              border-radius: 10px;
              padding: 25px;
              margin: 20px 0;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              border: 2px solid #E0AED0;
            }
            .match-name {
              color: #937DC2;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
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
            .celebration {
              font-size: 20px;
              color: #E0AED0;
              margin: 15px 0;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #777;
            }
            .unsubscribe {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🌸</div>
            <h2>Congratulations, ${recipientName}!</h2>
            <p class="celebration">Your seeds have bloomed into a match!</p>
            
            <div class="match-info">
              <div class="match-name">You matched with ${matchName}!</div>
              <p>You both sent each other seeds, which means you're both interested in getting to know each other better.</p>
              <p style="margin-top: 15px;">Now you can start chatting and see where this connection leads!</p>
            </div>
            
            <p>Why not send the first message? A simple "hello" can be the start of something beautiful.</p>
            
            <a href="${process.env.CLIENT_URL}/messages" class="button">Start Chatting</a>
            
            <div class="footer">
              <p>May your connection bloom beautifully! 🌺</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p>© 2024 Wallflower - Dating at your own pace</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #999;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Congratulations, ${recipientName}!
      
      Your seeds have bloomed into a match!
      
      You matched with ${matchName}!
      
      You both sent each other seeds, which means you're both interested in getting to know each other better.
      
      Now you can start chatting and see where this connection leads!
      
      Why not send the first message? A simple "hello" can be the start of something beautiful.
      
      Start chatting at: ${process.env.CLIENT_URL}/messages
      
      May your connection bloom beautifully!
      
      © 2024 Wallflower - Dating at your own pace
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  }),

  // 4. Low seed balance notification
  lowSeedBalance: (recipientName, currentBalance) => ({
    subject: '🌰 Your seed balance is running low',
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
            .balance-info {
              background-color: white;
              border-radius: 10px;
              padding: 25px;
              margin: 20px 0;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              border: 2px solid #F5E6D3;
            }
            .balance-number {
              font-size: 48px;
              color: #937DC2;
              font-weight: bold;
              margin: 10px 0;
            }
            .balance-label {
              color: #666;
              font-size: 18px;
            }
            .options {
              margin: 30px 0;
            }
            .option {
              background-color: white;
              border-radius: 10px;
              padding: 15px;
              margin: 10px 0;
              border: 1px solid #E0E0E0;
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
            .button-secondary {
              background: #B0C5A4;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 999px;
              font-weight: 500;
              display: inline-block;
              margin: 5px;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #777;
            }
            .unsubscribe {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🌰</div>
            <h2>Hi ${recipientName},</h2>
            <p>Your seed supply is running low!</p>
            
            <div class="balance-info">
              <div class="balance-label">Current Balance</div>
              <div class="balance-number">${currentBalance}</div>
              <div class="balance-label">seeds remaining</div>
            </div>
            
            <p>Don't let your garden stop growing! Here are your options:</p>
            
            <div class="options">
              <div class="option">
                <strong>🌟 Go Unlimited</strong>
                <p>Never worry about seeds again with our monthly membership</p>
                <a href="${process.env.CLIENT_URL}/profile#seeds" class="button-secondary">Learn More</a>
              </div>
              
              <div class="option">
                <strong>🌱 Get More Seeds</strong>
                <p>Choose from our seed packages starting at just $4.99</p>
                <a href="${process.env.CLIENT_URL}/profile#seeds" class="button-secondary">View Packages</a>
              </div>
            </div>
            
            <a href="${process.env.CLIENT_URL}/profile#seeds" class="button">Replenish Seeds</a>
            
            <div class="footer">
              <p>Keep your connections growing! 🌻</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p>© 2024 Wallflower - Dating at your own pace</p>
              <p class="unsubscribe">
                <a href="${process.env.CLIENT_URL}/settings/notifications" style="color: #999;">Manage notification preferences</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${recipientName},
      
      Your seed supply is running low!
      
      Current Balance: ${currentBalance} seeds remaining
      
      Don't let your garden stop growing! Here are your options:
      
      1. Go Unlimited - Never worry about seeds again with our monthly membership
      2. Get More Seeds - Choose from our seed packages starting at just $4.99
      
      Replenish your seeds at: ${process.env.CLIENT_URL}/profile#seeds
      
      Keep your connections growing!
      
      © 2024 Wallflower - Dating at your own pace
      
      Manage notification preferences: ${process.env.CLIENT_URL}/settings/notifications
    `
  })
};

// Notification service functions
const notificationService = {
  // 1. Send seed received notification
  sendSeedReceivedNotification: async (senderId, recipientId) => {
    try {
      const [sender, recipient] = await Promise.all([
        User.findById(senderId).select('username'),
        User.findById(recipientId).select('username email profile.notifications')
      ]);

      if (!sender || !recipient) {
        console.error('Users not found for seed notification');
        return { success: false, error: 'Users not found' };
      }

      // Check if user has email notifications enabled (default to true if not set)
      if (recipient.profile?.notifications?.emailEnabled === false) {
        return { success: false, error: 'User has disabled email notifications' };
      }

      const template = notificationTemplates.seedReceived(sender.username, recipient.username);
      
      return await sendEmail({
        to: recipient.email,
        ...template
      });
    } catch (error) {
      console.error('Error sending seed received notification:', error);
      return { success: false, error: error.message };
    }
  },

  // 2. Send new message notification
  sendNewMessageNotification: async (senderId, recipientId, messageContent) => {
    try {
      const [sender, recipient] = await Promise.all([
        User.findById(senderId).select('username'),
        User.findById(recipientId).select('username email profile.notifications')
      ]);

      if (!sender || !recipient) {
        console.error('Users not found for message notification');
        return { success: false, error: 'Users not found' };
      }

      // Check if user has email notifications enabled
      if (recipient.profile?.notifications?.emailEnabled === false) {
        return { success: false, error: 'User has disabled email notifications' };
      }

      // Truncate message for preview (max 100 characters)
      const messagePreview = messageContent.length > 100 
        ? messageContent.substring(0, 97) + '...' 
        : messageContent;

      const template = notificationTemplates.newMessage(
        sender.username, 
        recipient.username, 
        messagePreview
      );
      
      return await sendEmail({
        to: recipient.email,
        ...template
      });
    } catch (error) {
      console.error('Error sending message notification:', error);
      return { success: false, error: error.message };
    }
  },

  // 3. Send mutual seeds (match) notification
  sendMatchNotification: async (user1Id, user2Id) => {
    try {
      const [user1, user2] = await Promise.all([
        User.findById(user1Id).select('username email profile.notifications'),
        User.findById(user2Id).select('username email profile.notifications')
      ]);

      if (!user1 || !user2) {
        console.error('Users not found for match notification');
        return { success: false, error: 'Users not found' };
      }

      const results = [];

      // Send notification to user1 if enabled
      if (user1.profile?.notifications?.emailEnabled !== false) {
        const template1 = notificationTemplates.mutualSeeds(user2.username, user1.username);
        const result1 = await sendEmail({
          to: user1.email,
          ...template1
        });
        results.push(result1);
      }

      // Send notification to user2 if enabled
      if (user2.profile?.notifications?.emailEnabled !== false) {
        const template2 = notificationTemplates.mutualSeeds(user1.username, user2.username);
        const result2 = await sendEmail({
          to: user2.email,
          ...template2
        });
        results.push(result2);
      }

      return { 
        success: results.every(r => r.success), 
        results 
      };
    } catch (error) {
      console.error('Error sending match notifications:', error);
      return { success: false, error: error.message };
    }
  },

  // 4. Send low seed balance notification
  sendLowSeedBalanceNotification: async (userId) => {
    try {
      const user = await User.findById(userId).select('username email seeds.available profile.notifications');

      if (!user) {
        console.error('User not found for low balance notification');
        return { success: false, error: 'User not found' };
      }

      // Check if user has email notifications enabled
      if (user.profile?.notifications?.emailEnabled === false) {
        return { success: false, error: 'User has disabled email notifications' };
      }

      // Only send if balance is below 5
      if (user.seeds.available >= 5) {
        return { success: false, error: 'Seed balance is not low' };
      }

      const template = notificationTemplates.lowSeedBalance(
        user.username, 
        user.seeds.available
      );
      
      return await sendEmail({
        to: user.email,
        ...template
      });
    } catch (error) {
      console.error('Error sending low balance notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Check and send low balance notification after seed usage
  checkAndSendLowBalanceNotification: async (userId, newBalance) => {
    try {
      // Only send notification if balance just dropped below 5
      if (newBalance < 5 && newBalance >= 0) {
        // Check if we've already sent a notification recently (within 24 hours)
        const user = await User.findById(userId).select('profile.lastLowBalanceNotification');
        
        if (user?.profile?.lastLowBalanceNotification) {
          const lastNotification = new Date(user.profile.lastLowBalanceNotification);
          const hoursSinceLastNotification = (Date.now() - lastNotification) / (1000 * 60 * 60);
          
          if (hoursSinceLastNotification < 24) {
            return { success: false, error: 'Notification sent recently' };
          }
        }

        // Send notification and update last notification timestamp
        const result = await notificationService.sendLowSeedBalanceNotification(userId);
        
        if (result.success) {
          await User.findByIdAndUpdate(userId, {
            'profile.lastLowBalanceNotification': new Date()
          });
        }
        
        return result;
      }
      
      return { success: false, error: 'Balance not in notification range' };
    } catch (error) {
      console.error('Error checking low balance notification:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = notificationService;