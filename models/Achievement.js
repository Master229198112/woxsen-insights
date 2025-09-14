import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  basePost: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true,
    unique: true // One achievement record per blog post
  },
  
  // Achievement Classification
  achievementType: { 
    type: String, 
    enum: [
      'award', 
      'grant', 
      'fellowship', 
      'recognition', 
      'competition', 
      'certification', 
      'membership',
      'honor',
      'scholarship',
      'publication-milestone'
    ], 
    required: true 
  },
  
  // Basic Achievement Information
  achievementName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  awardingOrganization: { 
    type: String, 
    required: true,
    trim: true
  },
  organizationType: {
    type: String,
    enum: ['government', 'university', 'professional-body', 'industry', 'non-profit', 'international-org'],
    required: true
  },
  
  // Scope and Level
  level: { 
    type: String, 
    enum: ['international', 'national', 'regional', 'state', 'institutional', 'departmental'], 
    required: true 
  },
  competitionLevel: {
    type: String,
    enum: ['individual', 'team', 'collaborative'],
    default: 'individual'
  },
  
  // Important Dates
  receivedDate: { 
    type: Date, 
    required: true 
  },
  announcementDate: {
    type: Date
  },
  validFrom: {
    type: Date
  },
  validUntil: {
    type: Date
  },
  isLifetime: {
    type: Boolean,
    default: false
  },
  
  // Selection Process
  selectionProcess: {
    applicationRequired: {
      type: Boolean,
      default: false
    },
    nominationRequired: {
      type: Boolean,
      default: false
    },
    totalApplicants: Number,
    totalWinners: Number,
    selectionCriteria: [{
      type: String,
      trim: true
    }]
  },
  
  // Financial Information
  monetaryValue: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    isOneTime: {
      type: Boolean,
      default: true
    },
    disbursementSchedule: {
      type: String,
      enum: ['lump-sum', 'monthly', 'quarterly', 'annually', 'milestone-based']
    }
  },
  
  // Achievement Details
  achievementDescription: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  workRecognized: {
    title: String,
    description: String,
    category: String,
    collaborators: [{
      name: String,
      role: String,
      affiliation: String
    }]
  },
  
  // Supporting Documentation
  documentation: {
    certificateUrl: String,
    officialAnnouncementUrl: String,
    mediaUrls: [{
      type: String,
      description: String,
      mediaType: {
        type: String,
        enum: ['image', 'video', 'audio', 'document']
      }
    }],
    pressReleaseUrl: String,
    newsArticleUrls: [String]
  },
  
  // Verification and Authenticity
  verification: {
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    verificationSource: String,
    verificationUrl: String,
    verificationDate: Date,
    verificationNotes: String,
    officialContactPerson: {
      name: String,
      position: String,
      email: String,
      phone: String
    }
  },
  
  // Impact and Recognition
  impact: {
    mediaCoverage: [{
      outlet: String,
      url: String,
      publishedDate: Date,
      reach: Number
    }],
    followUpOpportunities: [{
      opportunity: String,
      description: String,
      status: {
        type: String,
        enum: ['offered', 'accepted', 'declined', 'pending']
      }
    }],
    careerImpact: {
      type: String,
      maxlength: 500
    }
  },
  
  // Collaborators and Team
  teamMembers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: String,
    affiliation: String,
    email: String,
    contribution: String,
    isMainContributor: {
      type: Boolean,
      default: false
    }
  }],
  
  // Categories and Tags
  researchArea: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  
  // Related Work
  relatedPublications: [{
    title: String,
    doi: String,
    url: String,
    relationship: String
  }],
  relatedProjects: [{
    projectName: String,
    description: String,
    url: String
  }],
  
  // Historical Context
  previousWinners: [{
    year: Number,
    name: String,
    affiliation: String,
    workRecognized: String
  }],
  
  // Social and Professional Impact
  professionalBenefits: [{
    benefit: String,
    description: String,
    realized: {
      type: Boolean,
      default: false
    }
  }],
  networkingOpportunities: [{
    event: String,
    date: Date,
    description: String,
    attended: {
      type: Boolean,
      default: false
    }
  }],
  
  // External Links and References
  externalLinks: {
    organizationWebsite: String,
    achievementPageUrl: String,
    linkedInPostUrl: String,
    twitterAnnouncementUrl: String,
    universityNewsUrl: String,
    personalWebsiteUrl: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
achievementSchema.index({ basePost: 1 });
achievementSchema.index({ achievementType: 1 });
achievementSchema.index({ level: 1 });
achievementSchema.index({ awardingOrganization: 1 });
achievementSchema.index({ receivedDate: -1 });
achievementSchema.index({ 'monetaryValue.amount': -1 });
achievementSchema.index({ 'verification.isVerified': 1 });
achievementSchema.index({ researchArea: 1 });
achievementSchema.index({ keywords: 1 });

// Virtual for achievement age (time since received)
achievementSchema.virtual('achievementAge').get(function() {
  if (!this.receivedDate) return null;
  const now = new Date();
  const received = new Date(this.receivedDate);
  const diffTime = Math.abs(now - received);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for current validity status
achievementSchema.virtual('isCurrentlyValid').get(function() {
  if (this.isLifetime) return true;
  if (!this.validUntil) return true;
  return new Date() <= new Date(this.validUntil);
});

// Virtual for formatted monetary value
achievementSchema.virtual('formattedValue').get(function() {
  if (!this.monetaryValue || !this.monetaryValue.amount) return 'No monetary value';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.monetaryValue.currency || 'USD'
  });
  return formatter.format(this.monetaryValue.amount);
});

// Method to check if achievement is prestigious (international/national level)
achievementSchema.methods.isPrestigious = function() {
  return ['international', 'national'].includes(this.level);
};

// Method to get main team member (excluding self)
achievementSchema.methods.getMainCollaborator = function() {
  return this.teamMembers.find(member => member.isMainContributor && member.name !== this.basePost?.author?.name);
};

// Method to calculate competition selectivity
achievementSchema.methods.getSelectivityRatio = function() {
  if (!this.selectionProcess.totalApplicants || !this.selectionProcess.totalWinners) return null;
  return (this.selectionProcess.totalWinners / this.selectionProcess.totalApplicants * 100).toFixed(2);
};

// Method to check if achievement has significant impact
achievementSchema.methods.hasSignificantImpact = function() {
  const hasMediaCoverage = this.impact.mediaeCoverage && this.impact.mediaCoverage.length > 0;
  const hasHighValue = this.monetaryValue && this.monetaryValue.amount && this.monetaryValue.amount > 10000;
  const isPrestigious = this.isPrestigious();
  const isVerified = this.verification.isVerified;
  
  return hasMediaCoverage || hasHighValue || isPrestigious || isVerified;
};

// Pre-save middleware
achievementSchema.pre('save', function(next) {
  // Ensure keywords are unique and lowercase
  if (this.keywords) {
    this.keywords = [...new Set(this.keywords.map(k => k.toLowerCase().trim()))];
  }
  
  // Ensure research areas are unique and properly formatted
  if (this.researchArea) {
    this.researchArea = [...new Set(this.researchArea.map(area => 
      area.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).trim()
    ))];
  }
  
  // Auto-set validity dates for certain achievement types
  if (this.achievementType === 'certification' && !this.validUntil && !this.isLifetime) {
    const received = new Date(this.receivedDate);
    this.validUntil = new Date(received.setFullYear(received.getFullYear() + 3)); // 3 years validity
  }
  
  // Ensure at least one team member is marked as main contributor if team achievement
  if (this.competitionLevel === 'team' && this.teamMembers.length > 0) {
    const hasMainContributor = this.teamMembers.some(member => member.isMainContributor);
    if (!hasMainContributor) {
      this.teamMembers[0].isMainContributor = true;
    }
  }
  
  next();
});

// Post-save middleware to update user stats
achievementSchema.post('save', async function(doc) {
  try {
    // Update user's total achievements count
    const User = mongoose.models.User;
    if (User && doc.basePost) {
      const blog = await mongoose.models.Blog.findById(doc.basePost).populate('author');
      if (blog && blog.author) {
        await User.findByIdAndUpdate(
          blog.author._id,
          { $inc: { 'profileStats.totalAchievements': 1 } }
        );
      }
    }
  } catch (error) {
    console.error('Error updating user achievement stats:', error);
  }
});

export default mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);
