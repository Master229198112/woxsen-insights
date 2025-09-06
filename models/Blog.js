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
    required: true, // Make slug required to prevent null values
    unique: true, // This already creates the index we need
  },
}, {
  timestamps: true,
});

// Helper function to generate slug with better fallbacks
function generateSlug(title) {
  if (!title || typeof title !== 'string') {
    return 'untitled-post';
  }
  
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters but keep hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 50) // Limit length
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // If slug is empty after processing, use fallback
  if (!slug || slug.length === 0) {
    slug = 'untitled-post';
  }
  
  return slug;
}

// Generate unique slug before saving - MORE ROBUST VERSION
blogSchema.pre('save', async function(next) {
  try {
    // Always ensure we have a slug
    if (!this.slug || this.isModified('title')) {
      const baseSlug = generateSlug(this.title);
      let slug = baseSlug;
      let counter = 1;
      
      // Check for existing slugs and make unique
      let existingBlog = await mongoose.models.Blog.findOne({ 
        slug, 
        _id: { $ne: this._id } 
      });
      
      while (existingBlog) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        existingBlog = await mongoose.models.Blog.findOne({ 
          slug, 
          _id: { $ne: this._id } 
        });
      }
      
      this.slug = slug;
    }
    
    next();
  } catch (error) {
    // If slug generation fails, create a unique fallback
    this.slug = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    next();
  }
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
// REMOVED: blogSchema.index({ slug: 1 }, { unique: true }); 
// The slug index is already created by the "unique: true" in the schema definition

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
