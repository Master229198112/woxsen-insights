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
    enum: [
      'research', 
      'achievements', 
      'publications', 
      'events', 
      'patents',
      'case-studies',
      'blogs',
      'industry-collaborations'
    ],
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
    sparse: true, // This allows multiple null values
  },
}, {
  timestamps: true,
});

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 50) // Limit length
    .replace(/-+$/, ''); // Remove trailing hyphens
}

// Generate unique slug before saving
blogSchema.pre('save', async function(next) {
  // Only generate slug when title is modified and status is published
  if (this.isModified('title') || (this.isModified('status') && this.status === 'published')) {
    if (this.status === 'published' && !this.slug) {
      const baseSlug = generateSlug(this.title);
      let slug = baseSlug;
      let counter = 1;
      
      // Check for existing slugs and make unique
      while (await mongoose.models.Blog.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this.slug = slug;
    }
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
blogSchema.index({ slug: 1 }, { sparse: true }); // Sparse index allows multiple nulls

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
