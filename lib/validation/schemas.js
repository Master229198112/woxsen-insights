import { z } from 'zod';

// Base schema for all posts
export const basePostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z.string()
    .min(1, 'Content is required')
    .refine(content => content !== '<p></p>' && content.trim(), 'Content cannot be empty'),
  excerpt: z.string()
    .min(1, 'Excerpt is required')
    .max(300, 'Excerpt cannot exceed 300 characters'),
  tags: z.array(z.string()).optional().default([]),
  featuredImage: z.string()
    .min(1, 'Featured image is required')
    .url('Featured image must be a valid URL'),
  category: z.enum([
    'research', 
    'achievements', 
    'events', 
    'patents',
    'case-studies',
    'blogs',
    'industry-collaborations'
  ])
});

// Base schema for specialized categories (research, publications, patents, achievements, events)
// These categories don't need content and excerpt as they use specialized forms
export const specializedBaseSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z.string().optional().default(''), // Optional for specialized categories
  excerpt: z.string().optional().default(''), // Optional for specialized categories
  tags: z.array(z.string()).optional().default([]),
  featuredImage: z.string()
    .min(1, 'Featured image is required')
    .url('Featured image must be a valid URL'),
  category: z.enum([
    'research', 
    'achievements', 
    'events', 
    'patents',
    'case-studies',
    'blogs',
    'industry-collaborations'
  ])
});

// Co-author schema (reusable)
const coAuthorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  affiliation: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  orcid: z.string().optional(),
  linkedIn: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  researchGate: z.string().url('Invalid ResearchGate URL').optional().or(z.literal('')),
  isCorresponding: z.boolean().default(false)
});

// Research/Publications schema
export const researchSchema = specializedBaseSchema.extend({
  researchData: z.object({
    paperType: z.enum(['research', 'review', 'book', 'book-chapter', 'case-study']),
    abstract: z.string()
      .min(100, 'Abstract must be at least 100 characters')
      .max(2000, 'Abstract cannot exceed 2000 characters'),
    keywords: z.array(z.string())
      .min(3, 'At least 3 keywords are required')
      .max(10, 'Maximum 10 keywords allowed')
      .refine(keywords => keywords.every(k => k.trim()), 'All keywords must be non-empty'),
    
    // Publication Details
    journal: z.string().min(1, 'Journal name is required'),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    doi: z.string()
      .optional()
      .refine(doi => !doi || /^10\.\d{4,}\//.test(doi), 'Invalid DOI format'),
    publishedYear: z.number()
      .min(1900, 'Year must be after 1900')
      .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
    
    // Co-authors
    coAuthors: z.array(coAuthorSchema).optional().default([]),
    
    // Indexing Information
    indexedIn: z.object({
      scopus: z.boolean().default(false),
      wos: z.boolean().default(false),
      quartile: z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'Not Indexed']).default('Not Indexed'),
      impactFactor: z.number().min(0).max(50).optional(),
      hIndex: z.number().min(0).max(200).optional(),
      citations: z.number().min(0).optional().default(0)
    }).optional().default({}),
    
    // Research Type and Funding
    researchType: z.enum([
      'experimental', 'theoretical', 'computational', 
      'review', 'survey', 'case-study'
    ]).default('experimental'),
    fundingSource: z.string().optional(),
    
    // Ethics Approval (for research involving human/animal subjects)
    ethicsApproval: z.object({
      required: z.boolean().default(false),
      approvalNumber: z.string().optional(),
      approvalDate: z.string().optional() // We'll convert to Date later
    }).optional().default({ required: false }),
    
    // File attachments
    pdfUrl: z.string().url('Invalid PDF URL').optional().or(z.literal('')),
    supplementaryFiles: z.array(z.object({
      fileName: z.string(),
      fileUrl: z.string().url(),
      fileType: z.string()
    })).optional().default([]),
    
    // External Links
    externalLinks: z.object({
      pubmedId: z.string().optional(),
      arxivId: z.string().optional(),
      researchGateUrl: z.string().url().optional().or(z.literal('')),
      googleScholarUrl: z.string().url().optional().or(z.literal(''))
    }).optional().default({})
  })
});

// Patent schema
export const patentSchema = specializedBaseSchema.extend({
  patentData: z.object({
    // Patent Identification
    patentNumber: z.string().min(1, 'Patent number is required'),
    applicationNumber: z.string().optional(),
    patentType: z.enum(['utility', 'design', 'plant', 'provisional']).default('utility'),
    
    // Status Information
    status: z.enum([
      'filed', 'pending', 'under-examination', 
      'granted', 'expired', 'abandoned', 'rejected'
    ]),
    filingDate: z.string().min(1, 'Filing date is required'), // We'll convert to Date
    grantDate: z.string().optional(), // We'll convert to Date
    publicationDate: z.string().optional(),
    expiryDate: z.string().optional(),
    
    // Inventors
    inventors: z.array(z.object({
      name: z.string().min(1, 'Inventor name is required'),
      affiliation: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      orcid: z.string().optional(),
      isPrimary: z.boolean().default(false),
      contributionPercentage: z.number().min(0).max(100).optional()
    })).min(1, 'At least one inventor is required'),
    
    // Assignee
    assignee: z.object({
      name: z.string().optional(),
      type: z.enum(['individual', 'company', 'university', 'government']).default('university'),
      address: z.string().optional()
    }).optional().default({ type: 'university' }),
    
    // Legal Details
    patentOffice: z.string().min(1, 'Patent office is required'),
    jurisdiction: z.string().optional(),
    
    // Technical Details
    technicalField: z.string().max(500).optional(),
    background: z.string().max(2000).optional(),
    summary: z.string().max(1000).optional(),
    detailedDescription: z.string().optional(),
    
    // Claims
    claims: z.array(z.object({
      claimNumber: z.number().min(1),
      claimText: z.string().min(1, 'Claim text is required'),
      claimType: z.enum(['independent', 'dependent']).default('independent'),
      dependsOn: z.array(z.number()).optional().default([])
    })).optional().default([]),
    
    // Classifications
    ipcClassification: z.array(z.string()).optional().default([]),
    cpcClassification: z.array(z.string()).optional().default([]),
    
    // File Attachments
    pdfUrl: z.string().url().optional().or(z.literal('')),
    drawingsUrls: z.array(z.object({
      fileName: z.string(),
      fileUrl: z.string().url(),
      description: z.string().optional()
    })).optional().default([]),
    patentUrl: z.string().url().optional().or(z.literal('')),
    
    // Commercial Status
    commercialStatus: z.object({
      isCommercialized: z.boolean().default(false),
      licensingAvailable: z.boolean().default(false),
      commercialPartners: z.array(z.object({
        name: z.string(),
        relationship: z.enum(['licensee', 'co-developer', 'manufacturer', 'distributor'])
      })).optional().default([])
    }).optional().default({ isCommercialized: false, licensingAvailable: false })
  })
});

// Achievement schema
export const achievementSchema = specializedBaseSchema.extend({
  achievementData: z.object({
    // Achievement Classification
    achievementType: z.enum([
      'award', 'grant', 'fellowship', 'recognition', 
      'competition', 'certification', 'membership',
      'honor', 'scholarship', 'publication-milestone'
    ]),
    
    // Basic Information
    achievementName: z.string()
      .min(1, 'Achievement name is required')
      .max(200, 'Achievement name cannot exceed 200 characters'),
    awardingOrganization: z.string().min(1, 'Awarding organization is required'),
    organizationType: z.enum([
      'government', 'university', 'professional-body', 
      'industry', 'non-profit', 'international-org'
    ]),
    
    // Scope and Level
    level: z.enum(['international', 'national', 'regional', 'state', 'institutional', 'departmental']),
    competitionLevel: z.enum(['individual', 'team', 'collaborative']).default('individual'),
    
    // Dates
    receivedDate: z.string().min(1, 'Received date is required'), // We'll convert to Date
    announcementDate: z.string().optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    isLifetime: z.boolean().default(false),
    
    // Selection Process
    selectionProcess: z.object({
      applicationRequired: z.boolean().default(false),
      nominationRequired: z.boolean().default(false),
      totalApplicants: z.number().min(0).optional(),
      totalWinners: z.number().min(0).optional(),
      selectionCriteria: z.array(z.string()).optional().default([])
    }).optional().default({}),
    
    // Financial Information
    monetaryValue: z.object({
      amount: z.number().min(0).optional(),
      currency: z.string().default('USD'),
      isOneTime: z.boolean().default(true),
      disbursementSchedule: z.enum([
        'lump-sum', 'monthly', 'quarterly', 'annually', 'milestone-based'
      ]).optional()
    }).optional().default({ currency: 'USD', isOneTime: true }),
    
    // Description and Work
    achievementDescription: z.string().max(1000).optional(),
    workRecognized: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      collaborators: z.array(z.object({
        name: z.string().min(1),
        role: z.string().optional(),
        affiliation: z.string().optional()
      })).optional().default([])
    }).optional().default({}),
    
    // Documentation
    documentation: z.object({
      certificateUrl: z.string().url().optional().or(z.literal('')),
      officialAnnouncementUrl: z.string().url().optional().or(z.literal('')),
      mediaUrls: z.array(z.object({
        url: z.string().url(),
        description: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document'])
      })).optional().default([]),
      pressReleaseUrl: z.string().url().optional().or(z.literal(''))
    }).optional().default({}),
    
    // Verification
    verification: z.object({
      isVerified: z.boolean().default(false),
      verificationSource: z.string().optional(),
      verificationUrl: z.string().url().optional().or(z.literal('')),
      verificationNotes: z.string().optional()
    }).optional().default({ isVerified: false }),
    
    // Team Members (for team achievements)
    teamMembers: z.array(z.object({
      name: z.string().min(1, 'Team member name is required'),
      role: z.string().optional(),
      affiliation: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      contribution: z.string().optional(),
      isMainContributor: z.boolean().default(false)
    })).optional().default([]),
    
    // Categories and Keywords
    researchArea: z.array(z.string()).optional().default([]),
    keywords: z.array(z.string()).optional().default([])
  })
});

// Event schema
export const eventSchema = specializedBaseSchema.extend({
  eventData: z.object({
    // Basic Event Information
    eventName: z.string()
      .min(1, 'Event name is required')
      .max(200, 'Event name cannot exceed 200 characters'),
    eventType: z.enum([
      'conference', 'workshop', 'seminar', 'webinar',
      'symposium', 'lecture', 'training', 'networking',
      'competition', 'ceremony', 'exhibition', 'hackathon'
    ]),
    eventFormat: z.enum(['in-person', 'virtual', 'hybrid']),
    
    // Date and Time
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    startTime: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
    endTime: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
    timezone: z.string().default('Asia/Kolkata'),
    
    // Location
    location: z.object({
      venue: z.string().optional(),
      address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().default('India'),
        postalCode: z.string().optional()
      }).optional(),
      room: z.string().optional(),
      building: z.string().optional(),
      campus: z.string().optional(),
      virtualLink: z.string().url().optional().or(z.literal('')),
      coordinates: z.object({
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional()
      }).optional()
    }).refine(data => {
      // Virtual events need virtual link, in-person events need venue
      return true; // We'll handle this validation in the component
    }).optional().default({}),
    
    // Organizer
    organizer: z.object({
      primaryOrganizer: z.object({
        name: z.string().min(1, 'Primary organizer name is required'),
        email: z.string().email('Invalid email format'),
        phone: z.string().optional(),
        affiliation: z.string().optional()
      }),
      coOrganizers: z.array(z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal('')),
        affiliation: z.string().optional(),
        role: z.string().optional()
      })).optional().default([]),
      organizingInstitution: z.string().min(1, 'Organizing institution is required'),
      sponsors: z.array(z.object({
        name: z.string().min(1),
        type: z.enum(['title', 'presenting', 'supporting', 'media', 'venue']).optional(),
        logoUrl: z.string().url().optional().or(z.literal('')),
        websiteUrl: z.string().url().optional().or(z.literal(''))
      })).optional().default([])
    }),
    
    // Registration
    registration: z.object({
      isRegistrationRequired: z.boolean().default(true),
      registrationUrl: z.string().url().optional().or(z.literal('')),
      registrationDeadline: z.string().optional(),
      registrationFee: z.object({
        amount: z.number().min(0).optional(),
        currency: z.string().default('INR'),
        feeStructure: z.array(z.object({
          category: z.string(),
          amount: z.number().min(0),
          description: z.string().optional()
        })).optional().default([])
      }).optional(),
      maxParticipants: z.number().min(1).optional(),
      currentRegistrations: z.number().min(0).default(0),
      waitlistAvailable: z.boolean().default(false)
    }).optional().default({ isRegistrationRequired: true }),
    
    // Speakers
    speakers: z.array(z.object({
      name: z.string().min(1, 'Speaker name is required'),
      designation: z.string().optional(),
      affiliation: z.string().optional(),
      bio: z.string().max(1000).optional(),
      photoUrl: z.string().url().optional().or(z.literal('')),
      topicTitle: z.string().optional(),
      topicDescription: z.string().optional(),
      speakerType: z.enum(['keynote', 'invited', 'panel', 'workshop-leader', 'presenter']).default('presenter'),
      socialProfiles: z.object({
        linkedin: z.string().url().optional().or(z.literal('')),
        twitter: z.string().url().optional().or(z.literal('')),
        website: z.string().url().optional().or(z.literal(''))
      }).optional().default({})
    })).optional().default([]),
    
    // Resources
    resources: z.object({
      eventPosterUrl: z.string().url().optional().or(z.literal('')),
      brochureUrl: z.string().url().optional().or(z.literal('')),
      presentationUrls: z.array(z.object({
        title: z.string(),
        url: z.string().url(),
        speaker: z.string().optional()
      })).optional().default([]),
      recordingUrl: z.string().url().optional().or(z.literal('')),
      photoGalleryUrls: z.array(z.string().url()).optional().default([]),
      documentsUrls: z.array(z.object({
        title: z.string(),
        url: z.string().url(),
        description: z.string().optional()
      })).optional().default([])
    }).optional().default({}),
    
    // Status
    eventStatus: z.enum([
      'planned', 'registration-open', 'registration-closed', 
      'in-progress', 'completed', 'cancelled', 'postponed'
    ]).default('planned'),
    
    // Attendance
    attendance: z.object({
      expectedAttendees: z.number().min(0).optional(),
      actualAttendees: z.number().min(0).optional(),
      attendanceRate: z.number().min(0).max(100).optional(),
      feedbackCollected: z.boolean().default(false),
      averageRating: z.number().min(0).max(5).optional(),
      feedbackCount: z.number().min(0).default(0)
    }).optional().default({})
  }).refine(data => {
    // Custom validation: end date should be after start date
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate >= startDate;
  }, {
    message: 'End date must be after start date',
    path: ['eventData', 'endDate']
  }).refine(data => {
    // Custom validation: virtual events need virtual link
    if (data.eventFormat === 'virtual') {
      return data.location?.virtualLink && data.location.virtualLink.trim();
    }
    return true;
  }, {
    message: 'Virtual events require a virtual meeting link',
    path: ['eventData', 'location', 'virtualLink']
  }).refine(data => {
    // Custom validation: in-person events need venue
    if (data.eventFormat === 'in-person') {
      return data.location?.venue && data.location.venue.trim();
    }
    return true;
  }, {
    message: 'In-person events require a venue',
    path: ['eventData', 'location', 'venue']
  })
});

// Blog schema (for regular blogs, case studies, etc.)
export const blogSchema = basePostSchema;

// Combined schema that validates based on category
export const dynamicPostSchema = z.discriminatedUnion('category', [
  researchSchema.extend({ category: z.literal('research') }),
  patentSchema.extend({ category: z.literal('patents') }),
  achievementSchema.extend({ category: z.literal('achievements') }),
  eventSchema.extend({ category: z.literal('events') }),
  blogSchema.extend({ category: z.literal('blogs') }),
  blogSchema.extend({ category: z.literal('case-studies') }),
  blogSchema.extend({ category: z.literal('industry-collaborations') })
]);

// Helper function to get schema by category
export const getSchemaByCategory = (category) => {
  switch (category) {
    case 'research':
      return researchSchema;
    case 'patents':
      return patentSchema;
    case 'achievements':
      return achievementSchema;
    case 'events':
      return eventSchema;
    case 'blogs':
    case 'case-studies':
    case 'industry-collaborations':
    default:
      return blogSchema;
  }
};

// Export validation function
export const validatePostData = (data) => {
  try {
    const schema = getSchemaByCategory(data.category);
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      errors: error.errors?.map(err => ({
        path: err.path.join('.'),
        message: err.message
      })) || [{ path: 'unknown', message: error.message }]
    };
  }
};
