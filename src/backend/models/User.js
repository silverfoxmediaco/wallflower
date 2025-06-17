// Updated User Model with Notification Preferences
// Path: src/backend/models/User.js
// Purpose: Add notification preferences and tracking fields

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  profile: {
    age: Number,
    height: String,
    bodyType: String,
    location: String,
    bio: {
      type: String,
      maxLength: 500,
    },
    interests: [{
      type: String,
    }],
    personalityType: String,
    lookingFor: String,
    photos: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      },
      isMain: {
        type: Boolean,
        default: false
      },
      displayMode: {
        type: String,
        enum: ['contain', 'cover'],
        default: 'contain'
      },
      thumbnailUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    prompts: [{
      question: String,
      answer: String,
    }],
    // Notification preferences
    notifications: {
      emailEnabled: {
        type: Boolean,
        default: true
      },
      seedReceived: {
        type: Boolean,
        default: true
      },
      newMessage: {
        type: Boolean,
        default: true
      },
      newMatch: {
        type: Boolean,
        default: true
      },
      lowSeedBalance: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    // Notification tracking
    lastLowBalanceNotification: {
      type: Date,
      default: null
    }
  },
  seeds: {
    available: {
      type: Number,
      default: 5,
    },
    sent: [{
      to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sentAt: Date,
    }],
    received: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      receivedAt: Date,
    }],
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  subscription: {
    stripeSubscriptionId: String,
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'unpaid', null],
      default: null
    },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    cancelledAt: Date
  },
  filterPreferences: {
    minAge: {
      type: Number,
      default: 18
    },
    maxAge: {
      type: Number,
      default: 100
    },
    distance: {
      type: Number,
      default: 50
    },
    interestedIn: {
      type: String,
      enum: ['men', 'women', 'everyone'],
      default: 'everyone'
    },
    hasPhoto: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);