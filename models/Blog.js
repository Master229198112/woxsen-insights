import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['research', 'achievements', 'publications', 'events', 'patents','case-studies','blogs','industry-collaborations'],
    required: [true, 'Category is required'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  featuredImage: {
    type: String,
    required: [true, 'Featured image is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'published', 'rejected'],
    default: 'pending',
  },
  isHeroPost: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  publishedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple documents with null/undefined slug
  },
}, {
  timestamps: true,
});

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && this.status === 'published') {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '-' + Date.now();
  }
  next();
});

// Set publishedAt when status changes to published
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Create indexes (REMOVED DUPLICATE SLUG INDEX)
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });
// REMOVED: blogSchema.index({ slug: 1 }); - This was causing the duplicate warning

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
