import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // For system notifications
  },
  type: {
    type: String,
    enum: [
      'blog_approved',
      'blog_rejected', 
      'blog_published',
      'blog_edited',
      'comment_added',
      'comment_reply',
      'blog_status_changed'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  relatedBlog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: false,
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // For additional notification data
    default: {},
  },
}, {
  timestamps: true,
});

// Create indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
