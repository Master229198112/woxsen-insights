import mongoose from 'mongoose';

const NewsletterDeliverySchema = new mongoose.Schema({
  newsletterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
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
  openedAt: {
    type: Date
  },
  clickedAt: {
    type: Date
  },
  bouncedAt: {
    type: Date
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
  failureReason: {
    type: String
  },
  messageId: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for querying deliveries by newsletter and status
NewsletterDeliverySchema.index({ newsletterId: 1, status: 1 });
NewsletterDeliverySchema.index({ newsletterId: 1, email: 1 }, { unique: true });

// Static method to get delivery stats for a newsletter
NewsletterDeliverySchema.statics.getDeliveryStats = async function(newsletterId) {
  const stats = await this.aggregate([
    { $match: { newsletterId: new mongoose.Types.ObjectId(newsletterId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    pending: 0,
    sent: 0,
    failed: 0,
    bounced: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Static method to get unsent subscribers for a newsletter
NewsletterDeliverySchema.statics.getUnsentEmails = async function(newsletterId) {
  const deliveries = await this.find({
    newsletterId,
    status: { $in: ['pending', 'failed'] }
  }).select('email');

  return deliveries.map(d => d.email);
};

// Static method to initialize delivery tracking for subscribers
NewsletterDeliverySchema.statics.initializeDeliveries = async function(newsletterId, subscriberEmails) {
  const deliveries = subscriberEmails.map(email => ({
    newsletterId,
    email,
    status: 'pending',
    attempts: 0
  }));

  await this.insertMany(deliveries, { ordered: false }).catch(err => {
    // Ignore duplicate key errors
    if (err.code !== 11000) throw err;
  });
};

const NewsletterDelivery = mongoose.models.NewsletterDelivery || mongoose.model('NewsletterDelivery', NewsletterDeliverySchema);

export default NewsletterDelivery;
