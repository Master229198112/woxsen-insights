import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: 'Woxsen Insights',
    required: true
  },
  siteDescription: {
    type: String,
    default: 'School of Business',
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  
  // User Management Settings
  allowRegistration: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: true
  },
  
  // Content Management Settings
  autoPublish: {
    type: Boolean,
    default: false
  },
  
  // System Settings
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'We are currently performing scheduled maintenance. Please check back soon.'
  },
  
  // Email Settings
  emailEnabled: {
    type: Boolean,
    default: false
  },
  smtpHost: {
    type: String,
    default: ''
  },
  smtpPort: {
    type: Number,
    default: 587
  },
  smtpUser: {
    type: String,
    default: ''
  },
  smtpPassword: {
    type: String,
    default: ''
  },
  
  // Advanced Settings
  maxFileSize: {
    type: Number,
    default: 10485760 // 10MB in bytes
  },
  allowedFileTypes: {
    type: [String],
    default: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// REMOVED THE PROBLEMATIC INDEX - MongoDB handles _id automatically
// settingsSchema.index({ _id: 1 }, { unique: true }); // REMOVE THIS LINE

// Static method to get settings (creates default if none exist)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    // Create default settings
    settings = new this({
      siteName: 'Woxsen Insights',
      siteDescription: 'School of Business',
      adminEmail: 'admin@woxsen.edu.in'
    });
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = new this(updates);
  } else {
    Object.assign(settings, updates);
  }
  
  settings.lastUpdated = new Date();
  settings.updatedBy = userId;
  
  return await settings.save();
};

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
