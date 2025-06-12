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
    enum: ['purchased', 'sent', 'received', 'bonus', 'refund', 'expired', 'system'],
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
  paymentAmount: {
    type: Number,
    required: false,
    // Amount paid in dollars (not cents)
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

// Virtual for transaction direction
seedTransactionSchema.virtual('direction').get(function() {
  return this.change > 0 ? 'credit' : 'debit';
});

// Ensure virtuals are included in JSON
seedTransactionSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('SeedTransaction', seedTransactionSchema);