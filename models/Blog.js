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
    // Content is optional for specialized categories
    required: false,
    default: '',
  },
  excerpt: {
    type: String,
    // Excerpt is optional for specialized categories  
    required: false,
    maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    default: '',
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
  imageAnalysis: {
    isAI: { type: Boolean, default: false },
    confidence: { type: Number, default: 0 },
    type: { type: String, default: 'authentic' }, // 'authentic', 'generated', 'enhanced', 'suspicious'
    generator: { type: String, default: null }, // 'ChatGPT', 'Midjourney', etc.
    indicators: [{ type: String }],
    metadata: { type: mongoose.Schema.Types.Mixed },
    analyzedAt: { type: Date, default: Date.now }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'published', 'rejected'],
    default: 'draft',
  },
  isDraft: {
    type: Boolean,
    default: true,
  },
  draftContent: {
    type: String, // For auto-saved drafts
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  editHistory: [{
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    editedAt: {
      type: Date,
      default: Date.now,
    },
    changes: {
      type: String, // Description of what was changed
    },
    version: {
      type: Number,
      default: 1,
    }
  }],
  autoSaveData: {
    title: String,
    content: String,
    excerpt: String,
    lastSaved: {
      type: Date,
      default: Date.now,
    }
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
  rejectionHistory: [{
    reason: {
      type: String,
      required: true,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rejectedAt: {
      type: Date,
      default: Date.now,
    },
    customReason: {
      type: String, // Custom rejection reason input
    }
  }],
  slug: {
    type: String,
    required: true, // Make slug required to prevent null values
    unique: true, // This already creates the index we need
  },
  
  // Category-specific data references
  researchData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research',
    default: null,
  },
  patentData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patent',
    default: null,
  },
  achievementData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    default: null,
  },
  eventData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null,
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
    // Always ensure we have a slug, especially if it's missing or title changed
    if (!this.slug || this.isModified('title') || this.slug === '' || this.slug === null) {
      console.log('Generating slug for blog:', this.title);
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
      console.log('Generated slug:', slug);
    }
    
    next();
  } catch (error) {
    console.error('Error generating slug:', error);
    // If slug generation fails, create a unique fallback
    this.slug = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Using fallback slug:', this.slug);
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

// Track edit history
blogSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified()) {
    const modifiedFields = this.modifiedPaths();
    const contentFields = ['title', 'content', 'excerpt', 'featuredImage', 'category', 'tags'];
    const hasContentChanges = modifiedFields.some(field => contentFields.includes(field));
    
    if (hasContentChanges && this.lastEditedBy) {
      const version = this.editHistory.length + 1;
      const changes = modifiedFields.filter(field => contentFields.includes(field)).join(', ');
      
      this.editHistory.push({
        editedBy: this.lastEditedBy,
        editedAt: new Date(),
        changes: `Modified: ${changes}`,
        version: version
      });
    }
  }
  next();
});

// Auto-save method
blogSchema.methods.autoSave = function(data) {
  this.autoSaveData = {
    ...data,
    lastSaved: new Date()
  };
  return this.save({ validateBeforeSave: false });
};

// Create indexes (REMOVED DUPLICATE SLUG INDEX)
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 'imageAnalysis.isAI': 1 }); // Index for AI detection queries
// REMOVED: blogSchema.index({ slug: 1 }, { unique: true }); 
// The slug index is already created by the "unique: true" in the schema definition

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
