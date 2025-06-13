// SeedTransaction Model
// Path: src/backend/models/SeedTransaction.js
// Purpose: Track all seed-related transactions

const mongoose = require('mongoose');

const seedTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['purchased', 'sent', 'received', 'bonus', 'refund', 'expired', 'system', 'subscription'],
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  change: {
    type: Number,
    required: true,
    // Positive for additions (purchased, received, bonus, refund)
    // Negative for deductions (sent, expired)
    // 0 for subscription (unlimited)
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    // For 'sent' type: the recipient
    // For 'received' type: the sender
  },
  description: {
    type: String,
    required: false,
    maxLength: 500
  },
  // Stripe-related fields for purchases
  stripeSessionId: {
    type: String,
    required: false,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: false,
    index: true,
    // For subscription transactions
  },
  paymentAmount: {
    type: Number,
    required: false,
    // Amount paid in dollars (not cents)
  },
  subscriptionDetails: {
    type: {
      type: String,
      enum: ['monthly', 'yearly']
    },
    status: {
      type: String,
      enum: ['started', 'renewed', 'cancelled', 'failed']
    },
    periodStart: Date,
    periodEnd: Date
  },
  // Admin tracking
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    // For bonus/refund transactions added by admin
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    // Additional data like package type, promo codes, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
seedTransactionSchema.index({ userId: 1, createdAt: -1 });
seedTransactionSchema.index({ userId: 1, type: 1 });
seedTransactionSchema.index({ relatedUser: 1, type: 1 });
seedTransactionSchema.index({ stripeSubscriptionId: 1 });

// Static methods for common queries
seedTransactionSchema.statics.getUserBalance = async function(userId) {
  const lastTransaction = await this.findOne({ userId })
    .sort({ createdAt: -1 })
    .select('balanceAfter');
  
  return lastTransaction ? lastTransaction.balanceAfter : 0;
};

seedTransactionSchema.statics.getUserTransactionsByType = async function(userId, type, limit = 10) {
  return await this.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('relatedUser', 'username profile.photos');
};

seedTransactionSchema.statics.getTotalPurchased = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), type: 'purchased' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

seedTransactionSchema.statics.getTotalSpent = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), type: 'sent' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

seedTransactionSchema.statics.getSubscriptionHistory = async function(userId) {
  return await this.find({ 
    userId, 
    type: 'subscription' 
  })
  .sort({ createdAt: -1 })
  .select('description subscriptionDetails paymentAmount createdAt');
};

seedTransactionSchema.statics.getTotalRevenue = async function(userId) {
  const result = await this.aggregate([
    { $match: { 
      userId: mongoose.Types.ObjectId(userId), 
      type: { $in: ['purchased', 'subscription'] },
      paymentAmount: { $exists: true }
    }},
    { $group: { _id: null, total: { $sum: '$paymentAmount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Instance methods
seedTransactionSchema.methods.getFormattedDate = function() {
  return this.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

seedTransactionSchema.methods.isSubscriptionActive = function() {
  if (this.type !== 'subscription') return false;
  return this.subscriptionDetails?.status === 'started' || 
         this.subscriptionDetails?.status === 'renewed';
};

// Virtual for transaction direction
seedTransactionSchema.virtual('direction').get(function() {
  if (this.type === 'subscription') return 'subscription';
  return this.change > 0 ? 'credit' : 'debit';
});

// Virtual for display amount
seedTransactionSchema.virtual('displayAmount').get(function() {
  if (this.type === 'subscription') return 'Unlimited';
  return this.amount;
});

// Ensure virtuals are included in JSON
seedTransactionSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('SeedTransaction', seedTransactionSchema);