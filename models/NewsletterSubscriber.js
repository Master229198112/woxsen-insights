import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  unsubscribeToken: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  },
  preferences: {
    weeklyDigest: {
      type: Boolean,
      default: true
    },
    achievements: {
      type: Boolean,
      default: true
    },
    publications: {
      type: Boolean,
      default: true
    },
    events: {
      type: Boolean,
      default: true
    },
    research: {
      type: Boolean,
      default: true
    }
  },
  source: {
    type: String,
    enum: ['blog-sidebar', 'footer', 'homepage', 'manual'],
    default: 'blog-sidebar'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
newsletterSubscriberSchema.index({ email: 1 });
newsletterSubscriberSchema.index({ isActive: 1 });
newsletterSubscriberSchema.index({ subscribedAt: -1 });

// Static method to get active subscribers
newsletterSubscriberSchema.statics.getActiveSubscribers = function() {
  return this.find({ isActive: true }).sort({ subscribedAt: -1 });
};

// Static method to get subscriber count
newsletterSubscriberSchema.statics.getSubscriberStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });
  const thisWeek = await this.countDocuments({
    subscribedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  
  return { total, active, thisWeek };
};

// Instance method to unsubscribe
newsletterSubscriberSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

export default mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
