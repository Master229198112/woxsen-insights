import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Newsletter title is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Newsletter content is required']
  },
  type: {
    type: String,
    enum: ['weekly-digest', 'manual', 'announcement'],
    default: 'weekly-digest'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date
  },
  sentDate: {
    type: Date
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  successfulSends: {
    type: Number,
    default: 0
  },
  failedSends: {
    type: Number,
    default: 0
  },
  openRate: {
    type: Number,
    default: 0
  },
  clickRate: {
    type: Number,
    default: 0
  },
  contentSummary: {
    blogs: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
      title: String,
      excerpt: String,
      author: String,
      publishedDate: Date
    }],
    research: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
      title: String,
      excerpt: String,
      author: String,
      publishedDate: Date
    }],
    achievements: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
      title: String,
      description: String,
      achievedBy: String,
      achievedDate: Date
    }],
    events: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
      title: String,
      description: String,
      eventDate: Date,
      location: String
    }],
    patents: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patent' },
      title: String,
      description: String,
      inventors: [String],
      filedDate: Date
    }]
  },
  templateVariables: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    weekRange: {
      start: Date,
      end: Date
    },
    errors: [String],
    sendingStarted: Date,
    sendingCompleted: Date
  },
  batchInfo: {
    totalBatches: {
      type: Number,
      default: 0
    },
    batchSize: {
      type: Number,
      default: 25
    },
    completedAt: {
      type: Date
    },
    processingTime: {
      type: Number // in milliseconds
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ type: 1 });
newsletterSchema.index({ scheduledDate: 1 });
newsletterSchema.index({ sentDate: -1 });
newsletterSchema.index({ 'metadata.weekRange.start': 1, 'metadata.weekRange.end': 1 });

// Static method to get recent newsletters
newsletterSchema.statics.getRecentNewsletters = function(limit = 10) {
  return this.find({ status: 'sent' })
    .sort({ sentDate: -1 })
    .limit(limit)
    .populate('metadata.createdBy', 'name email');
};

// Static method to get newsletter stats
newsletterSchema.statics.getNewsletterStats = async function() {
  const totalSent = await this.countDocuments({ status: 'sent' });
  const totalDrafts = await this.countDocuments({ status: 'draft' });
  const totalScheduled = await this.countDocuments({ status: 'scheduled' });
  const thisMonth = await this.countDocuments({
    status: 'sent',
    sentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  const avgOpenRate = await this.aggregate([
    { $match: { status: 'sent', openRate: { $gt: 0 } } },
    { $group: { _id: null, avgOpenRate: { $avg: '$openRate' } } }
  ]);

  const avgClickRate = await this.aggregate([
    { $match: { status: 'sent', clickRate: { $gt: 0 } } },
    { $group: { _id: null, avgClickRate: { $avg: '$clickRate' } } }
  ]);

  return {
    totalSent,
    totalDrafts,
    totalScheduled,
    thisMonth,
    avgOpenRate: avgOpenRate[0]?.avgOpenRate || 0,
    avgClickRate: avgClickRate[0]?.avgClickRate || 0
  };
};

// Instance method to mark as sent
newsletterSchema.methods.markAsSent = function(successCount, failedCount) {
  this.status = 'sent';
  this.sentDate = new Date();
  this.successfulSends = successCount;
  this.failedSends = failedCount;
  this.metadata.sendingCompleted = new Date();
  return this.save();
};

// Instance method to mark as failed
newsletterSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.metadata.errors.push(error);
  return this.save();
};

// Instance method to start sending
newsletterSchema.methods.startSending = function() {
  this.status = 'sending';
  this.metadata.sendingStarted = new Date();
  return this.save();
};

export default mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);
