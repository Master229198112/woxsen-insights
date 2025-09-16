import mongoose from 'mongoose';

const newsletterTrackingSchema = new mongoose.Schema({
  newsletterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true,
    index: true
  },
  subscriberEmail: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  type: {
    type: String,
    enum: ['open', 'click', 'unsubscribe'],
    required: true,
    index: true
  },
  trackingId: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String, // For click tracking - the original URL that was clicked
    required: function() { return this.type === 'click'; }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: String,
    location: {
      country: String,
      city: String,
      region: String
    },
    device: {
      type: String, // mobile, desktop, tablet
      os: String,
      browser: String
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
newsletterTrackingSchema.index({ newsletterId: 1, type: 1 });
newsletterTrackingSchema.index({ newsletterId: 1, subscriberEmail: 1, type: 1 });
newsletterTrackingSchema.index({ trackingId: 1, type: 1 });

// Static method to get tracking stats for a newsletter
newsletterTrackingSchema.statics.getNewsletterStats = async function(newsletterId) {
  const [opens, clicks, uniqueOpens, uniqueClicks] = await Promise.all([
    this.countDocuments({ newsletterId, type: 'open' }),
    this.countDocuments({ newsletterId, type: 'click' }),
    this.distinct('subscriberEmail', { newsletterId, type: 'open' }).then(emails => emails.length),
    this.distinct('subscriberEmail', { newsletterId, type: 'click' }).then(emails => emails.length)
  ]);

  return {
    totalOpens: opens,
    totalClicks: clicks,
    uniqueOpens,
    uniqueClicks
  };
};

// Static method to get subscriber engagement
newsletterTrackingSchema.statics.getSubscriberEngagement = async function(subscriberEmail) {
  const [opens, clicks] = await Promise.all([
    this.countDocuments({ subscriberEmail, type: 'open' }),
    this.countDocuments({ subscriberEmail, type: 'click' })
  ]);

  return { opens, clicks };
};

// Static method to get top performing links
newsletterTrackingSchema.statics.getTopLinks = async function(newsletterId, limit = 10) {
  return this.aggregate([
    { $match: { newsletterId: mongoose.Types.ObjectId(newsletterId), type: 'click' } },
    { 
      $group: { 
        _id: '$url', 
        clicks: { $sum: 1 },
        uniqueClicks: { $addToSet: '$subscriberEmail' }
      } 
    },
    { $addFields: { uniqueClickCount: { $size: '$uniqueClicks' } } },
    { $sort: { clicks: -1 } },
    { $limit: limit },
    { $project: { url: '$_id', clicks: 1, uniqueClickCount: 1, _id: 0 } }
  ]);
};

export default mongoose.models.NewsletterTracking || mongoose.model('NewsletterTracking', newsletterTrackingSchema);
