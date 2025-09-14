import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // This already creates an index
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but unique when present
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    validate: {
      validator: function(v) {
        // Allow null/undefined for existing users
        if (!v) return true;
        // Username should contain only letters, numbers, dots, underscores, and hyphens
        return /^[a-zA-Z0-9._-]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, dots, underscores, and hyphens'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['staff', 'admin'],
    default: 'staff',
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
  type: String,
  default: null,
},
resetPasswordExpiry: {
  type: Date,
  default: null,
},
bio: {
  type: String,
  default: '',
  maxlength: [500, 'Bio cannot exceed 500 characters']
},

// Social and Professional Profiles
socialProfiles: {
  linkedin: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9\-]+\/?$/.test(v);
      },
      message: 'Please enter a valid LinkedIn URL'
    }
  },
  orcid: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(v);
      },
      message: 'Please enter a valid ORCID URL'
    }
  },
  googleScholar: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?scholar\.google\.[a-z]+(\.[a-z]+)?\/citations\?user=[a-zA-Z0-9\-_]+/.test(v);
      },
      message: 'Please enter a valid Google Scholar URL'
    }
  },
  researchGate: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?researchgate\.net\/profile\/[a-zA-Z0-9\-_]+/.test(v);
      },
      message: 'Please enter a valid ResearchGate URL'
    }
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?[a-zA-Z0-9][a-zA-Z0-9\-]+[a-zA-Z0-9]\.[^\s]{2,}/.test(v);
      },
      message: 'Please enter a valid website URL'
    }
  },
  twitter: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/.test(v);
      },
      message: 'Please enter a valid Twitter/X URL'
    }
  }
},

// Academic and Professional Information
academicInfo: {
  designation: {
    type: String,
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    field: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear() + 10
    },
    isHighestDegree: {
      type: Boolean,
      default: false
    }
  }],
  researchInterests: [{
    type: String,
    trim: true,
    maxlength: [100, 'Research interest cannot exceed 100 characters']
  }],
  expertise: [{
    area: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50
    }
  }],
  teachingAreas: [{
    subject: String,
    level: {
      type: String,
      enum: ['undergraduate', 'postgraduate', 'doctoral', 'professional']
    },
    yearsTeaching: Number
  }]
},

// Profile Statistics and Metrics
profileStats: {
  followersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  followingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPosts: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPublications: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPatents: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAchievements: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEvents: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCitations: {
    type: Number,
    default: 0,
    min: 0
  },
  hIndex: {
    type: Number,
    default: 0,
    min: 0,
    max: 200
  },
  i10Index: {
    type: Number,
    default: 0,
    min: 0
  },
  profileViews: {
    type: Number,
    default: 0,
    min: 0
  },
  lastStatsUpdate: {
    type: Date,
    default: Date.now
  }
},

// Privacy and Visibility Settings
privacySettings: {
  isPublic: {
    type: Boolean,
    default: true
  },
  showEmail: {
    type: Boolean,
    default: false
  },
  showSocialProfiles: {
    type: Boolean,
    default: true
  },
  showStats: {
    type: Boolean,
    default: true
  },
  showFollowers: {
    type: Boolean,
    default: true
  },
  allowDirectMessages: {
    type: Boolean,
    default: true
  },
  showOnlineStatus: {
    type: Boolean,
    default: false
  }
},

// Profile Verification
verification: {
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verificationBadges: [{
    type: {
      type: String,
      enum: ['email', 'institution', 'orcid', 'social-media', 'expert']
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    verificationSource: String
  }]
},

// Activity and Engagement
activityLog: {
  lastLogin: Date,
  lastProfileUpdate: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  averageSessionDuration: {
    type: Number, // in minutes
    default: 0
  }
},

// Professional Affiliations
affiliations: [{
  organization: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  startDate: Date,
  endDate: Date,
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: 500
  }
}],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update profile stats
userSchema.methods.updateProfileStats = async function(statsUpdate = {}) {
  Object.keys(statsUpdate).forEach(key => {
    if (this.profileStats[key] !== undefined) {
      this.profileStats[key] = statsUpdate[key];
    }
  });
  this.profileStats.lastStatsUpdate = new Date();
  await this.save();
};

// Instance method to check if profile is complete
userSchema.methods.isProfileComplete = function() {
  const requiredFields = [
    this.name,
    this.email,
    this.department,
    this.bio
  ];
  
  const hasBasicInfo = requiredFields.every(field => field && field.trim());
  const hasQualifications = this.academicInfo?.qualifications?.length > 0;
  
  return hasBasicInfo && hasQualifications;
};

// Instance method to get profile completion percentage
userSchema.methods.getProfileCompletionPercentage = function() {
  let completedFields = 0;
  let totalFields = 0;
  
  // Basic fields (40% weight)
  const basicFields = [this.name, this.email, this.department, this.bio];
  basicFields.forEach(field => {
    totalFields++;
    if (field && field.trim()) completedFields++;
  });
  
  // Profile image (10% weight)
  totalFields++;
  if (this.profileImage) completedFields++;
  
  // Academic info (30% weight)
  totalFields++;
  if (this.academicInfo?.qualifications?.length > 0) completedFields++;
  
  totalFields++;
  if (this.academicInfo?.designation) completedFields++;
  
  totalFields++;
  if (this.academicInfo?.researchInterests?.length > 0) completedFields++;
  
  // Social profiles (20% weight)
  const socialProfiles = Object.values(this.socialProfiles || {});
  const hasSocialProfiles = socialProfiles.some(profile => profile && profile.trim());
  totalFields++;
  if (hasSocialProfiles) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
};

// Instance method to get display name with designation
userSchema.methods.getDisplayName = function() {
  const designation = this.academicInfo?.designation;
  return designation ? `${designation} ${this.name}` : this.name;
};

// Instance method to get highest qualification
userSchema.methods.getHighestQualification = function() {
  if (!this.academicInfo?.qualifications?.length) return null;
  
  return this.academicInfo.qualifications.find(q => q.isHighestDegree) ||
         this.academicInfo.qualifications[this.academicInfo.qualifications.length - 1];
};

// Instance method to get URL slug (username or name-based)
userSchema.methods.getUrlSlug = function() {
  if (this.username) {
    return this.username;
  }
  
  // Generate slug from name if no username
  return this.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 30) // Limit length
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Instance method to generate unique username from name
userSchema.methods.generateUniqueUsername = async function() {
  if (this.username) return this.username;
  
  const baseUsername = this.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .substring(0, 25);
  
  let username = baseUsername;
  let counter = 1;
  
  // Check if username exists
  while (await mongoose.models.User.findOne({ username, _id: { $ne: this._id } })) {
    username = `${baseUsername}.${counter}`;
    counter++;
  }
  
  return username;
};

// Static method to get user suggestions based on department/interests
userSchema.statics.getUserSuggestions = async function(userId, limit = 10) {
  try {
    const user = await this.findById(userId);
    if (!user) return [];
    
    const suggestions = await this.aggregate([
      {
        $match: {
          _id: { $ne: mongoose.Types.ObjectId(userId) },
          isApproved: true,
          'privacySettings.isPublic': true,
          $or: [
            { department: user.department },
            { 'academicInfo.researchInterests': { $in: user.academicInfo?.researchInterests || [] } }
          ]
        }
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              { $cond: [{ $eq: ['$department', user.department] }, 2, 0] },
              { $size: { $setIntersection: ['$academicInfo.researchInterests', user.academicInfo?.researchInterests || []] } }
            ]
          }
        }
      },
      { $sort: { relevanceScore: -1, 'profileStats.followersCount': -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          department: 1,
          profileImage: 1,
          'academicInfo.designation': 1,
          'profileStats.followersCount': 1,
          'profileStats.totalPosts': 1,
          relevanceScore: 1
        }
      }
    ]);
    
    return suggestions;
  } catch (error) {
    console.error('Error getting user suggestions:', error);
    return [];
  }
};

// Virtual for full name with designation
userSchema.virtual('fullDisplayName').get(function() {
  return this.getDisplayName();
});

// Virtual for profile completion status
userSchema.virtual('profileCompletion').get(function() {
  return {
    percentage: this.getProfileCompletionPercentage(),
    isComplete: this.isProfileComplete()
  };
});

// Static method to find user by slug (username or name)
userSchema.statics.findBySlug = async function(slug) {
  // First try to find by username
  let user = await this.findOne({ 
    username: slug.toLowerCase(),
    isApproved: true,
    role: { $in: ['staff', 'admin'] }
  }).select('name email department profileImage bio createdAt username');
  
  if (user) return user;
  
  // If not found, try to find by name slug
  const users = await this.find({
    isApproved: true,
    role: { $in: ['staff', 'admin'] }
  }).select('name email department profileImage bio createdAt username');
  
  // Find user whose name slug matches
  for (const candidate of users) {
    if (candidate.getUrlSlug() === slug) {
      return candidate;
    }
  }
  
  return null;
};

// Create indexes (removed duplicate email index)
// userSchema.index({ email: 1 }); // REMOVED - email already has unique: true
userSchema.index({ username: 1 }); // Index for username lookups
userSchema.index({ role: 1 });
userSchema.index({ isApproved: 1 });
userSchema.index({ department: 1 });
userSchema.index({ 'academicInfo.researchInterests': 1 });
userSchema.index({ 'profileStats.followersCount': -1 });
userSchema.index({ 'profileStats.totalPosts': -1 });
userSchema.index({ 'privacySettings.isPublic': 1 });
userSchema.index({ 'verification.isVerified': 1 });
userSchema.index({ 'activityLog.lastLogin': -1 });
userSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
