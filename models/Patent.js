import mongoose from 'mongoose';

const patentSchema = new mongoose.Schema({
  basePost: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true,
    unique: true // One patent record per blog post
  },
  
  // Patent Identification
  patentNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    uppercase: true
  },
  applicationNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  patentType: { 
    type: String, 
    enum: ['utility', 'design', 'plant', 'provisional'], 
    default: 'utility' 
  },
  
  // Status Information
  status: { 
    type: String, 
    enum: ['filed', 'pending', 'under-examination', 'granted', 'expired', 'abandoned', 'rejected'], 
    required: true 
  },
  filingDate: { 
    type: Date, 
    required: true 
  },
  grantDate: {
    type: Date
  },
  publicationDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  
  // Inventors and Assignees
  inventors: [{
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
    isPrimary: { 
      type: Boolean, 
      default: false 
    },
    contributionPercentage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  
  assignee: {
    name: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['individual', 'company', 'university', 'government'],
      default: 'university'
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  // Legal and Jurisdiction Details
  patentOffice: { 
    type: String, 
    required: true,
    trim: true
  }, // USPTO, EPO, IPO, etc.
  jurisdiction: {
    type: String,
    trim: true
  },
  priorityClaim: {
    hasProperty: {
      type: Boolean,
      default: false
    },
    priorApplicationNumber: String,
    priorFilingDate: Date,
    priorCountry: String
  },
  
  // Technical Details
  technicalField: {
    type: String,
    trim: true,
    maxlength: 500
  },
  background: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  detailedDescription: {
    type: String,
    trim: true
  },
  claims: [{
    claimNumber: {
      type: Number,
      required: true
    },
    claimText: {
      type: String,
      required: true,
      trim: true
    },
    claimType: {
      type: String,
      enum: ['independent', 'dependent'],
      default: 'independent'
    },
    dependsOn: [{
      type: Number
    }]
  }],
  
  // Classification
  ipcClassification: [{
    type: String,
    trim: true
  }], // International Patent Classification
  cpcClassification: [{
    type: String,
    trim: true
  }], // Cooperative Patent Classification
  
  // File Attachments and Links
  pdfUrl: {
    type: String,
    trim: true
  },
  drawingsUrls: [{
    fileName: String,
    fileUrl: String,
    description: String
  }],
  patentUrl: {
    type: String,
    trim: true
  }, // Official patent office link
  
  // Commercial and Legal Status
  commercialStatus: {
    isCommercialized: {
      type: Boolean,
      default: false
    },
    licensingAvailable: {
      type: Boolean,
      default: false
    },
    commercialPartners: [{
      name: String,
      relationship: {
        type: String,
        enum: ['licensee', 'co-developer', 'manufacturer', 'distributor']
      }
    }]
  },
  
  legalStatus: {
    isActive: {
      type: Boolean,
      default: true
    },
    maintenanceFeePaid: {
      type: Boolean,
      default: true
    },
    nextMaintenanceDue: Date,
    legalNotes: String
  },
  
  // Financial Information
  costs: {
    filingCost: Number,
    prosecutionCost: Number,
    maintenanceCost: Number,
    totalCost: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Related Patents
  relatedPatents: [{
    patentNumber: String,
    relationship: {
      type: String,
      enum: ['continuation', 'divisional', 'continuation-in-part', 'related']
    },
    description: String
  }],
  
  // External Links and References
  externalLinks: {
    googlePatentsUrl: String,
    espacenetUrl: String,
    patentScopeUrl: String,
    priorArtReferences: [{
      type: String,
      title: String,
      url: String
    }]
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
patentSchema.index({ basePost: 1 });
patentSchema.index({ patentNumber: 1 });
patentSchema.index({ applicationNumber: 1 });
patentSchema.index({ status: 1 });
patentSchema.index({ patentOffice: 1 });
patentSchema.index({ filingDate: -1 });
patentSchema.index({ grantDate: -1 });
patentSchema.index({ technicalField: 1 });
patentSchema.index({ 'assignee.name': 1 });

// Virtual for patent age
patentSchema.virtual('patentAge').get(function() {
  if (!this.grantDate) return null;
  const now = new Date();
  const granted = new Date(this.grantDate);
  return Math.floor((now - granted) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for time to grant
patentSchema.virtual('timeToGrant').get(function() {
  if (!this.grantDate || !this.filingDate) return null;
  const granted = new Date(this.grantDate);
  const filed = new Date(this.filingDate);
  return Math.floor((granted - filed) / (30.44 * 24 * 60 * 60 * 1000)); // months
});

// Method to check if patent is still valid
patentSchema.methods.isValid = function() {
  if (this.status !== 'granted') return false;
  if (this.expiryDate && new Date() > this.expiryDate) return false;
  return this.legalStatus.isActive && this.legalStatus.maintenanceFeePaid;
};

// Method to get primary inventor
patentSchema.methods.getPrimaryInventor = function() {
  return this.inventors.find(inventor => inventor.isPrimary) || this.inventors[0];
};

// Method to calculate remaining patent life
patentSchema.methods.getRemainingLife = function() {
  if (!this.expiryDate || this.status !== 'granted') return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  if (now > expiry) return 0;
  return Math.floor((expiry - now) / (365.25 * 24 * 60 * 60 * 1000));
};

// Pre-save middleware
patentSchema.pre('save', function(next) {
  // Auto-generate expiry date for utility patents (20 years from filing)
  if (this.patentType === 'utility' && this.status === 'granted' && !this.expiryDate && this.filingDate) {
    const filingDate = new Date(this.filingDate);
    this.expiryDate = new Date(filingDate.setFullYear(filingDate.getFullYear() + 20));
  }
  
  // Ensure at least one inventor is marked as primary
  if (this.inventors.length > 0 && !this.inventors.some(inv => inv.isPrimary)) {
    this.inventors[0].isPrimary = true;
  }
  
  // Calculate total cost
  if (this.costs) {
    this.costs.totalCost = (this.costs.filingCost || 0) + 
                           (this.costs.prosecutionCost || 0) + 
                           (this.costs.maintenanceCost || 0);
  }
  
  next();
});

export default mongoose.models.Patent || mongoose.model('Patent', patentSchema);
