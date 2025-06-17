// Message Controller
// Path: src/backend/controllers/messageController.js
// Purpose: Handle message-related operations

const Message = require('../models/Messages');
const User = require('../models/User');
const SeedTransaction = require('../models/SeedTransaction');
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/uploadMiddleware');

// Get all conversations for the logged-in user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.getConversationsForUser(req.userId);
    
    res.json({
      success: true,
      conversations: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Get messages between logged-in user and another user
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;
    
    // Check if users are matched
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(userId);
    
    if (!currentUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if they have exchanged seeds (are matched)
    const currentUserSentSeed = currentUser.seeds.sent.some(
      seed => seed.to.toString() === userId
    );
    const otherUserSentSeed = otherUser.seeds.sent.some(
      seed => seed.to.toString() === currentUserId
    );
    
    if (!currentUserSentSeed || !otherUserSentSeed) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you are matched with'
      });
    }
    
    // Get conversation ID
    const conversationId = Message.getConversationId(currentUserId, userId);
    
    // Fetch messages
    const messages = await Message.find({
      conversationId: conversationId,
      deleted: false
    })
    .populate('sender', 'username profile.photos')
    .populate('receiver', 'username profile.photos')
    .sort({ createdAt: 1 });
    
    // Mark messages as read where current user is receiver
    await Message.updateMany(
      {
        conversationId: conversationId,
        receiver: currentUserId,
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );
    
    // Get other user info
    const otherUserInfo = {
      _id: otherUser._id,
      username: otherUser.username,
      profile: {
        photos: otherUser.profile.photos
      }
    };
    
    res.json({
      success: true,
      messages: messages,
      otherUser: otherUserInfo,
      conversationId: conversationId
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Send a text message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.userId;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }
    
    // Check if users are matched
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    
    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const senderSentSeed = sender.seeds.sent.some(
      seed => seed.to.toString() === receiverId
    );
    const receiverSentSeed = receiver.seeds.sent.some(
      seed => seed.to.toString() === senderId
    );
    
    if (!senderSentSeed || !receiverSentSeed) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you are matched with'
      });
    }
    
    // Create conversation ID
    const conversationId = Message.getConversationId(senderId, receiverId);
    
    // Create message
    const message = new Message({
      conversationId: conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      messageType: 'text',
      seedCost: 0
    });
    
    await message.save();
    
    // Populate sender info
    await message.populate('sender', 'username profile.photos');
    
    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('new_message', {
        message: message,
        conversationId: conversationId
      });
    }
    
    res.json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Send an image message (costs 1 seed)
exports.sendImage = [
  upload.single('image'), 
  async (req, res) => {
    try {
      const { receiverId } = req.body;
      const senderId = req.userId;
      
      console.log('Send image request:', {
        receiverId,
        senderId,
        file: req.file ? 'File uploaded' : 'No file',
        fileDetails: req.file
      });
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image provided'
        });
      }
      
      // Check if users are matched
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      
      if (!sender || !receiver) {
        // Clean up uploaded image
        if (req.file.filename) {
          await cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const senderSentSeed = sender.seeds.sent.some(
        seed => seed.to.toString() === receiverId
      );
      const receiverSentSeed = receiver.seeds.sent.some(
        seed => seed.to.toString() === senderId
      );
      
      if (!senderSentSeed || !receiverSentSeed) {
        // Clean up uploaded image
        if (req.file.filename) {
          await cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(403).json({
          success: false,
          message: 'You can only message users you are matched with'
        });
      }
      
      // Check if user has subscription or enough seeds
      const hasActiveSubscription = sender.subscription && 
        sender.subscription.status === 'active' && 
        (!sender.subscription.cancelAtPeriodEnd || new Date(sender.subscription.currentPeriodEnd) > new Date());
      
      if (!hasActiveSubscription && sender.seeds.available < 1) {
        // Clean up uploaded image
        if (req.file.filename) {
          await cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(400).json({
          success: false,
          message: 'Insufficient seeds. You need 1 seed to send an image.'
        });
      }
      
      // Get the Cloudinary URL from the uploaded file
      const imageUrl = req.file.path || req.file.secure_url;
      const imagePublicId = req.file.filename || req.file.public_id;
      
      console.log('Cloudinary upload result:', {
        imageUrl,
        imagePublicId
      });
      
      // Deduct seed if no active subscription
      if (!hasActiveSubscription) {
        sender.seeds.available -= 1;
        await sender.save();
        
        // Create seed transaction
        await SeedTransaction.create({
          userId: senderId,
          type: 'spent',
          amount: 1,
          change: -1,
          balanceAfter: sender.seeds.available,
          description: `Sent image to ${receiver.username}`,
          relatedUser: receiverId
        });
      }
      
      // Create conversation ID
      const conversationId = Message.getConversationId(senderId, receiverId);
      
      // Create message
      const message = new Message({
        conversationId: conversationId,
        sender: senderId,
        receiver: receiverId,
        messageType: 'image',
        imageUrl: imageUrl,
        imagePublicId: imagePublicId,
        seedCost: hasActiveSubscription ? 0 : 1
      });
      
      await message.save();
      
      // Populate sender info
      await message.populate('sender', 'username profile.photos');
      
      // Emit socket event for real-time messaging
      const io = req.app.get('io');
      if (io) {
        io.to(receiverId).emit('new_message', {
          message: message,
          conversationId: conversationId
        });
      }
      
      res.json({
        success: true,
        message: message,
        remainingSeeds: sender.seeds.available
      });
    } catch (error) {
      console.error('Send image error:', error);
      
      // Clean up uploaded image on error
      if (req.file && (req.file.filename || req.file.public_id)) {
        try {
          await cloudinary.uploader.destroy(req.file.filename || req.file.public_id);
        } catch (deleteError) {
          console.error('Error deleting uploaded image:', deleteError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to send image',
        error: error.message
      });
    }
  }
];

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    
    const result = await Message.updateMany(
      {
        conversationId: conversationId,
        receiver: userId,
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );
    
    // Emit socket event for read receipts
    const io = req.app.get('io');
    if (io && result.modifiedCount > 0) {
      // Get the other user in the conversation
      const message = await Message.findOne({ conversationId: conversationId });
      if (message) {
        const otherUserId = message.sender.toString() === userId ? 
          message.receiver.toString() : message.sender.toString();
        
        io.to(otherUserId).emit('messages_read', {
          conversationId: conversationId,
          readBy: userId
        });
      }
    }
    
    res.json({
      success: true,
      markedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Only sender can delete their own messages
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }
    
    // Soft delete
    await message.softDelete(userId);
    
    // If it's an image, delete from Cloudinary
    if (message.messageType === 'image' && message.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(message.imagePublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }
    
    // Emit socket event for message deletion
    const io = req.app.get('io');
    if (io) {
      io.to(message.receiver.toString()).emit('message_deleted', {
        messageId: messageId,
        conversationId: message.conversationId
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      read: false,
      deleted: false
    });
    
    res.json({
      success: true,
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};