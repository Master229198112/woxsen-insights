import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  basePost: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true,
    unique: true // One research record per blog post
  },
  
  // Paper Details
  paperType: { 
    type: String, 
    enum: ['research', 'review', 'book', 'book-chapter', 'case-study'], 
    required: true 
  },
  abstract: { 
    type: String, 
    required: true, 
    maxlength: 2000 // Increased for detailed abstracts
  },
  keywords: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // Publication Details
  journal: { 
    type: String, 
    required: true,
    trim: true
  },
  volume: {
    type: String,
    trim: true
  },
  issue: {
    type: String,
    trim: true
  },
  pages: {
    type: String,
    trim: true
  },
  doi: {
    type: String,
    trim: true,
    lowercase: true
  },
  publishedYear: { 
    type: Number, 
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  
  // Authors (Co-authors besides the main author)
  coAuthors: [{
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    affiliation: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(email) {
          return !email || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: 'Please enter a valid email address'
      }
    },
    orcid: {
      type: String,
      trim: true
    },
    linkedIn: {
      type: String,
      trim: true
    },
    researchGate: {
      type: String,
      trim: true
    },
    isCorresponding: { 
      type: Boolean, 
      default: false 
    }
  }],
  
  // Indexing Information
  indexedIn: {
    scopus: { 
      type: Boolean, 
      default: false 
    },
    wos: { 
      type: Boolean, 
      default: false 
    },
    quartile: { 
      type: String, 
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Not Indexed', ''],
      default: 'Not Indexed'
    },
    impactFactor: {
      type: Number,
      min: 0,
      max: 50 // Reasonable upper limit
    },
    hIndex: {
      type: Number,
      min: 0,
      max: 200 // Reasonable upper limit
    },
    citations: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // File Attachments
  pdfUrl: {
    type: String,
    trim: true
  },
  supplementaryFiles: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Research-specific metadata
  researchType: {
    type: String,
    enum: ['experimental', 'theoretical', 'computational', 'review', 'survey', 'case-study'],
    default: 'experimental'
  },
  fundingSource: {
    type: String,
    trim: true
  },
  ethicsApproval: {
    required: {
      type: Boolean,
      default: false
    },
    approvalNumber: String,
    approvalDate: Date
  },
  
  // External Links
  externalLinks: {
    pubmedId: String,
    arxivId: String,
    researchGateUrl: String,
    googleScholarUrl: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
researchSchema.index({ basePost: 1 });
researchSchema.index({ journal: 1 });
researchSchema.index({ publishedYear: -1 });
researchSchema.index({ 'indexedIn.quartile': 1 });
researchSchema.index({ keywords: 1 });
researchSchema.index({ paperType: 1 });

// Virtual for full citation
researchSchema.virtual('citation').get(function() {
  const authors = this.coAuthors.map(author => author.name).join(', ');
  return `${authors}. "${this.basePost?.title}". ${this.journal}${this.volume ? `, Vol. ${this.volume}` : ''}${this.issue ? `, Issue ${this.issue}` : ''}${this.pages ? `, pp. ${this.pages}` : ''}. ${this.publishedYear}.${this.doi ? ` DOI: ${this.doi}` : ''}`;
});

// Method to check if research is highly indexed
researchSchema.methods.isHighlyIndexed = function() {
  return this.indexedIn.scopus && this.indexedIn.wos && ['Q1', 'Q2'].includes(this.indexedIn.quartile);
};

// Pre-save middleware
researchSchema.pre('save', function(next) {
  // Ensure keywords are unique and lowercase
  if (this.keywords) {
    this.keywords = [...new Set(this.keywords.map(k => k.toLowerCase().trim()))];
  }
  next();
});

export default mongoose.models.Research || mongoose.model('Research', researchSchema);
