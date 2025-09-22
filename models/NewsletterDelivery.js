import mongoose from 'mongoose';

const newsletterDeliverySchema = new mongoose.Schema({
  newsletterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced'],
    default: 'pending',
    index: true
  },
  sentAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date
  },
  error: {
    type: String
  },
  messageId: {
    type: String // Email service message ID
  },
  trackingId: {
    type: String, // Unique ID for tracking opens/clicks
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Compound indexes
newsletterDeliverySchema.index({ newsletterId: 1, email: 1 }, { unique: true });
newsletterDeliverySchema.index({ newsletterId: 1, status: 1 });

// Static methods
newsletterDeliverySchema.statics.createDeliveryRecord = function(newsletterId, email, trackingId) {
  return this.findOneAndUpdate(
    { newsletterId, email },
    { 
      newsletterId, 
      email, 
      trackingId,
      status: 'pending',
      $inc: { attempts: 1 },
      lastAttemptAt: new Date()
    },
    { upsert: true, new: true }
  );
};

newsletterDeliverySchema.statics.markAsSent = function(newsletterId, email, messageId) {
  return this.findOneAndUpdate(
    { newsletterId, email },
    { 
      status: 'sent',
      sentAt: new Date(),
      messageId
    },
    { new: true }
  );
};

newsletterDeliverySchema.statics.markAsFailed = function(newsletterId, email, reason) {
  return this.findOneAndUpdate(
    { newsletterId, email },
    { 
      status: 'failed',
      failureReason: reason,
      error: reason,
      lastAttemptAt: new Date()
    },
    { new: true }
  );
};

newsletterDeliverySchema.statics.getFailedEmails = function(newsletterId) {
  return this.find({ 
    newsletterId, 
    status: { $in: ['failed', 'pending'] } 
  }).select('email status failureReason attempts');
};

newsletterDeliverySchema.statics.getDeliveryStats = function(newsletterId) {
  return this.aggregate([
    { $match: { newsletterId: new mongoose.Types.ObjectId(newsletterId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.models.NewsletterDelivery || mongoose.model('NewsletterDelivery', newsletterDeliverySchema);
