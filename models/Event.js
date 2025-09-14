import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  basePost: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true,
    unique: true // One event record per blog post
  },
  
  // Basic Event Information
  eventName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  eventType: {
    type: String,
    enum: [
      'conference',
      'workshop',
      'seminar',
      'webinar',
      'symposium',
      'lecture',
      'training',
      'networking',
      'competition',
      'ceremony',
      'exhibition',
      'hackathon'
    ],
    required: true
  },
  
  // Event Details
  eventFormat: {
    type: String,
    enum: ['in-person', 'virtual', 'hybrid'],
    required: true
  },
  
  // Date and Time Information
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(endDate) {
        return endDate >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  startTime: {
    type: String, // Format: HH:MM
    required: true,
    validate: {
      validator: function(time) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Please enter time in HH:MM format'
    }
  },
  endTime: {
    type: String, // Format: HH:MM
    required: true,
    validate: {
      validator: function(time) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Please enter time in HH:MM format'
    }
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata' // IST for Woxsen
  },
  
  // Location Information
  location: {
    venue: {
      type: String,
      required: function() { return this.eventFormat !== 'virtual'; },
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      },
      postalCode: String
    },
    room: String,
    building: String,
    campus: String,
    virtualLink: {
      type: String,
      required: function() { return this.eventFormat !== 'in-person'; },
      validate: {
        validator: function(url) {
          return !url || /^https?:\/\/.+/.test(url);
        },
        message: 'Please enter a valid URL for virtual link'
      }
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  // Organizer Information
  organizer: {
    primaryOrganizer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        validate: {
          validator: function(email) {
            return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
          },
          message: 'Please enter a valid email address'
        }
      },
      phone: String,
      affiliation: String
    },
    coOrganizers: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: String,
      affiliation: String,
      role: String
    }],
    organizingInstitution: {
      type: String,
      required: true,
      trim: true
    },
    sponsors: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['title', 'presenting', 'supporting', 'media', 'venue']
      },
      logoUrl: String,
      websiteUrl: String
    }]
  },
  
  // Registration and Participation
  registration: {
    isRegistrationRequired: {
      type: Boolean,
      default: true
    },
    registrationUrl: String,
    registrationDeadline: Date,
    registrationFee: {
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      feeStructure: [{
        category: String, // e.g., 'Student', 'Faculty', 'Industry'
        amount: Number,
        description: String
      }]
    },
    maxParticipants: {
      type: Number,
      min: 1
    },
    currentRegistrations: {
      type: Number,
      default: 0,
      min: 0
    },
    waitlistAvailable: {
      type: Boolean,
      default: false
    }
  },
  
  // Speakers and Presenters
  speakers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: String,
    affiliation: String,
    bio: {
      type: String,
      maxlength: 1000
    },
    photoUrl: String,
    topicTitle: String,
    topicDescription: String,
    speakerType: {
      type: String,
      enum: ['keynote', 'invited', 'panel', 'workshop-leader', 'presenter'],
      default: 'presenter'
    },
    socialProfiles: {
      linkedin: String,
      twitter: String,
      website: String
    },
    timeSlot: {
      startTime: String,
      endTime: String,
      sessionTitle: String
    }
  }],
  
  // Event Resources and Materials
  resources: {
    eventPosterUrl: String,
    brochureUrl: String,
    presentationUrls: [{
      title: String,
      url: String,
      speaker: String
    }],
    recordingUrl: String, // For recorded sessions
    photoGalleryUrls: [String],
    documentsUrls: [{
      title: String,
      url: String,
      description: String
    }]
  },
  
  // Event Status and Tracking
  eventStatus: {
    type: String,
    enum: ['planned', 'registration-open', 'registration-closed', 'in-progress', 'completed', 'cancelled', 'postponed'],
    default: 'planned'
  },
  
  // Attendance and Engagement
  attendance: {
    expectedAttendees: Number,
    actualAttendees: Number,
    attendanceRate: {
      type: Number,
      min: 0,
      max: 100
    },
    feedbackCollected: {
      type: Boolean,
      default: false
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5
    },
    feedbackCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
eventSchema.index({ basePost: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ eventFormat: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ eventStatus: 1 });
eventSchema.index({ 'organizer.organizingInstitution': 1 });

// Virtual for event duration in hours
eventSchema.virtual('durationInHours').get(function() {
  const start = new Date(`1970-01-01T${this.startTime}:00`);
  const end = new Date(`1970-01-01T${this.endTime}:00`);
  const durationMs = end - start;
  return Math.round(durationMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
});

// Virtual for event duration in days
eventSchema.virtual('durationInDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  if (!this.registration.isRegistrationRequired) return 'not-required';
  if (this.registration.registrationDeadline && new Date() > this.registration.registrationDeadline) {
    return 'closed';
  }
  if (this.registration.maxParticipants && this.registration.currentRegistrations >= this.registration.maxParticipants) {
    return this.registration.waitlistAvailable ? 'waitlist' : 'full';
  }
  return 'open';
});

// Method to check if event is happening now
eventSchema.methods.isHappeningNow = function() {
  const now = new Date();
  const eventStart = new Date(this.startDate);
  const eventEnd = new Date(this.endDate);
  
  return now >= eventStart && now <= eventEnd;
};

// Method to check if event is upcoming (within next 30 days)
eventSchema.methods.isUpcoming = function() {
  const now = new Date();
  const eventStart = new Date(this.startDate);
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  return eventStart > now && eventStart <= thirtyDaysFromNow;
};

// Method to get keynote speakers
eventSchema.methods.getKeynoteSpeakers = function() {
  return this.speakers.filter(speaker => speaker.speakerType === 'keynote');
};

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Auto-calculate attendance rate
  if (this.attendance.expectedAttendees && this.attendance.actualAttendees) {
    this.attendance.attendanceRate = Math.round((this.attendance.actualAttendees / this.attendance.expectedAttendees) * 100);
  }
  
  // Ensure end date is after start date if both are set
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.endDate = this.startDate;
  }
  
  next();
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
