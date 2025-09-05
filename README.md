# Woxsen Insights Platform

A comprehensive content management and insights sharing platform for Woxsen University School of Business, designed to showcase academic excellence, research achievements, and thought leadership.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Current Status](#current-status)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

Woxsen Insights is a modern web platform that enables faculty, staff, and administrators at Woxsen University School of Business to share research findings, achievements, publications, and insights with the academic community. The platform features a sophisticated content management system, user authentication, and newsletter functionality.

### Key Objectives

- **Academic Excellence Showcase**: Highlight research, publications, and achievements
- **Knowledge Sharing**: Enable easy content creation and distribution
- **Community Engagement**: Build an engaged academic community through newsletters and social features
- **Professional Presentation**: Maintain high standards of design and functionality
- **SEO Optimization**: Ensure content reaches the widest possible audience

## Features

### Current Implementation (v1.0)

#### Authentication & User Management
- **NextAuth.js Integration**: Secure authentication system
- **Role-Based Access Control**: Admin and Staff user roles
- **User Registration Workflow**: Admin approval process for new users
- **Profile Management**: Users can edit profiles and change passwords

#### Content Management System
- **Rich Text Editor**: TipTap-powered editor with formatting options
- **Image Upload System**: Cloudinary integration for media storage
- **8 Content Categories**:
  - Research
  - Achievements
  - Publications
  - Events
  - Patents
  - Case Studies
  - Blogs
  - Industry Collaborations
- **Blog Approval Workflow**: Admin review and approval process
- **SEO-Friendly URLs**: Automatic slug generation for all content
- **Tag System**: Categorization and searchability
- **View Tracking**: Analytics for content engagement

#### Admin Dashboard
- **User Management**: Approve/reject registrations, manage user roles
- **Content Moderation**: Review and approve blog submissions
- **Analytics Dashboard**: View statistics and engagement metrics
- **Settings Management**: Configure platform behavior
- **Newsletter Management**: Subscriber analytics and content generation

#### Public Interface
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Category Navigation**: Browse content by category
- **Search & Filtering**: Find content by category, author, and tags
- **Social Sharing**: WhatsApp, LinkedIn, and link sharing
- **Newsletter Subscription**: Email signup with validation

#### Newsletter System
- **Subscription Management**: User email collection and preferences
- **Weekly Content Aggregation**: Automatic content compilation
- **Admin Newsletter Tools**: Send test emails and manage subscribers
- **Unsubscribe System**: GDPR-compliant opt-out functionality

### Technical Features
- **SEO Optimization**: Meta tags, structured data, and clean URLs
- **Performance Optimized**: Image optimization and caching
- **Security**: Input validation, CSRF protection, and secure headers
- **Scalable Architecture**: Built for growth and high traffic
- **Maintenance Mode**: System-wide maintenance capability

## Technology Stack

### Frontend
- **Next.js 15.5.2**: React framework with App Router
- **React 19.1.0**: Modern React with latest features
- **TailwindCSS 4.0**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Lucide React**: Icon system
- **TipTap**: Rich text editor
- **Next Cloudinary**: Image optimization and management

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling
- **NextAuth.js**: Authentication library
- **bcryptjs**: Password hashing

### Infrastructure
- **Vercel**: Hosting and deployment platform
- **Cloudinary**: Image and media management
- **MongoDB Atlas**: Cloud database hosting

### Development Tools
- **ESLint**: Code linting and quality
- **Git**: Version control
- **VS Code**: Recommended development environment

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB installation
- Cloudinary account for image storage
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/woxsen-insights.git
   cd woxsen-insights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/woxsen-insights

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Optional: Email Service (for newsletters)
   SENDGRID_API_KEY=your-sendgrid-key
   NEWSLETTER_FROM_EMAIL=newsletter@woxsen.edu.in
   ```

4. **Initialize Database**
   ```bash
   # The application will automatically create necessary collections
   # Create your first admin user through the registration process
   npm run dev
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Initial Setup

1. **Register First Admin User**
   - Go to `/auth/register`
   - Create an account with admin privileges
   - Manually set role to 'admin' in MongoDB for the first user

2. **Configure Settings**
   - Access admin dashboard at `/admin`
   - Configure site settings, email preferences, and content policies

3. **Create Content Categories**
   - Categories are pre-configured in the system
   - Start creating content in various categories

## Project Structure

```
woxsen-insights/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard pages
│   │   ├── analytics/
│   │   ├── blogs/
│   │   ├── settings/
│   │   └── users/
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin-only endpoints
│   │   ├── auth/                 # Authentication
│   │   ├── blogs/                # Blog CRUD operations
│   │   ├── newsletter/           # Newsletter management
│   │   └── user/                 # User profile management
│   ├── auth/                     # Authentication pages
│   ├── blog/[id]/               # Individual blog pages
│   ├── category/[slug]/         # Category listing pages
│   ├── dashboard/               # User dashboard
│   └── maintenance/             # Maintenance mode page
├── components/                   # Reusable React components
│   ├── admin/                   # Admin-specific components
│   ├── blog/                    # Blog-related components
│   ├── category/                # Category components
│   ├── layout/                  # Layout components (Navbar, Footer)
│   └── ui/                      # Base UI components
├── lib/                         # Utility libraries
│   ├── mongodb.js              # Database connection
│   ├── auth-config.js          # NextAuth configuration
│   ├── utils.js                # Helper functions
│   └── settings.js             # Settings management
├── models/                      # MongoDB schemas
│   ├── Blog.js                 # Blog data model
│   ├── User.js                 # User data model
│   ├── Comment.js              # Comment system
│   ├── Settings.js             # Platform settings
│   └── NewsletterSubscriber.js # Newsletter subscribers
├── public/                     # Static assets
├── middleware.js               # Route protection and redirects
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # TailwindCSS configuration
└── package.json               # Dependencies and scripts
```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register          # User registration
POST /api/auth/signin           # User login
POST /api/auth/signout          # User logout
POST /api/auth/forgot-password  # Password reset
```

### Blog Management

```
GET    /api/blogs               # Get published blogs (public)
POST   /api/blogs               # Create new blog (authenticated)
GET    /api/blogs/[id]          # Get specific blog by ID or slug
PUT    /api/blogs/[id]          # Update blog (author/admin only)
DELETE /api/blogs/[id]          # Delete blog (author/admin only)
```

### Admin Endpoints

```
GET  /api/admin                 # Dashboard statistics
GET  /api/admin/users           # User management
POST /api/admin/users           # User approval/rejection
GET  /api/admin/blogs           # Blog moderation
POST /api/admin/blogs           # Blog approval/rejection
GET  /api/admin/settings        # Get platform settings
POST /api/admin/settings        # Update platform settings
```

### Newsletter System

```
POST /api/newsletter/subscribe    # Subscribe to newsletter
POST /api/newsletter/unsubscribe  # Unsubscribe from newsletter
GET  /api/admin/newsletter        # Newsletter analytics (admin)
POST /api/admin/newsletter        # Send newsletters (admin)
```

## Current Status

### Completed Features ✅

- [x] User authentication and authorization
- [x] Blog creation and management system
- [x] Admin dashboard with full functionality
- [x] 8-category content organization system
- [x] SEO-friendly URL structure with automatic slug generation
- [x] Image upload and management
- [x] Newsletter subscription system
- [x] Responsive design for all devices
- [x] Social sharing functionality
- [x] View tracking and analytics
- [x] Settings management system
- [x] Comment system with moderation
- [x] Search and filtering capabilities

### Recent Updates 🔄

- **Slug System Overhaul**: Implemented robust SEO-friendly URL generation
- **Newsletter Infrastructure**: Complete subscription and management system
- **Enhanced Admin Dashboard**: Real-time analytics and content management
- **Mobile Optimization**: Improved responsive design and navigation
- **Security Enhancements**: Updated authentication and input validation

### Known Issues 🐛

- Newsletter email service integration pending (SendGrid setup required)
- Advanced search functionality could be enhanced
- Image optimization could be further improved
- Social media auto-posting not yet implemented

## Future Roadmap

### Phase 1 🎯

#### Email Service Integration
- **SendGrid Integration**: Complete newsletter email sending capability
- **Automated Weekly Newsletters**: Cron job implementation for weekly content digests
- **Email Templates**: Professional HTML email templates with Woxsen branding
- **Email Analytics**: Open rates, click tracking, and engagement metrics

#### Enhanced Content Features
- **Advanced Search**: Full-text search across all content
- **Related Content Algorithm**: Intelligent content recommendations
- **Content Series**: Link related blog posts in series
- **Featured Content Rotation**: Dynamic homepage content

### Phase 2 🚀

#### User Experience Enhancements
- **Progressive Web App (PWA)**: Mobile app-like experience
- **Offline Reading**: Cache content for offline access
- **Push Notifications**: Notify users of new content
- **Personalized Dashboard**: Customized content feeds

#### Advanced Analytics
- **Content Performance Metrics**: Detailed engagement analytics
- **User Behavior Tracking**: Reading patterns and preferences
- **A/B Testing Framework**: Test different content formats
- **SEO Analytics Integration**: Google Analytics and Search Console

#### Social Features
- **User Comments and Discussions**: Enhanced commenting system
- **Author Profiles**: Detailed faculty and staff profiles
- **Social Media Integration**: Auto-posting to LinkedIn, Twitter
- **Content Sharing Analytics**: Track social sharing performance

### Phase 3 📈

#### Enterprise Features
- **Multi-language Support**: Hindi and English content
- **Advanced User Roles**: Reviewers, editors, contributors
- **Content Scheduling**: Plan and schedule content publication
- **Workflow Management**: Editorial calendar and content planning

#### Integration Ecosystem
- **University Systems Integration**: Connect with existing LMS/CRM
- **Calendar Integration**: Sync with university event calendars
- **Alumni Network**: Connect with alumni management systems
- **Research Database**: Link to institutional research repositories

#### Advanced Customization
- **White-label Platform**: Customizable branding for different departments
- **Custom Content Types**: Beyond blogs (videos, podcasts, infographics)
- **API for Third-party Integrations**: External system connectivity
- **Mobile App Development**: Native iOS and Android applications

### Long-term Vision 🌟

#### AI and Machine Learning
- **Content Recommendation Engine**: AI-powered content suggestions
- **Automated Content Summarization**: AI-generated excerpts and summaries
- **Sentiment Analysis**: Track content reception and engagement
- **Predictive Analytics**: Forecast content performance

#### Global Expansion
- **Multi-campus Support**: Support for multiple university locations
- **International Content Syndication**: Share content with partner institutions
- **Global Alumni Network**: Worldwide alumni engagement platform
- **Research Collaboration Platform**: Connect researchers globally

## Contributing

### Development Workflow

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes and Test**
   ```bash
   npm run dev
   npm run lint
   ```
4. **Commit Changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push and Create Pull Request**

### Code Standards

- **ESLint Configuration**: Follow provided linting rules
- **Component Structure**: Use functional components with hooks
- **TypeScript**: Gradually migrating to TypeScript (future enhancement)
- **Testing**: Write tests for new features (Jest setup planned)

### Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
- Screenshots if applicable
- Console error messages

## Deployment

### Vercel Deployment (Recommended)

1. **Connect GitHub Repository**
   - Link your GitHub repository to Vercel
   - Configure automatic deployments

2. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure MongoDB Atlas allows Vercel IP addresses

3. **Domain Configuration**
   - Set up custom domain ([sobinsights.aircwou.in](https://sobinsights.aircwou.in/))
   - Configure DNS settings
   - Enable HTTPS

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database Considerations

- **MongoDB Atlas**: Recommended for production
- **Backup Strategy**: Regular automated backups
- **Scaling**: Monitor and scale based on usage
- **Security**: Enable authentication and SSL

## Troubleshooting

### Common Issues

#### Slug Generation Errors
```
Error: E11000 duplicate key error collection: test.blogs index: slug_1
```
**Solution**: Run the slug cleanup script:
```bash
# Via browser
http://localhost:3000/api/fix-slugs-public

# Or via CLI
cd lib && node fix-slugs.js
```

#### Authentication Issues
```
Error: NextAuth configuration error
```
**Solution**: Verify environment variables:
- `NEXTAUTH_URL` matches your domain
- `NEXTAUTH_SECRET` is set and secure
- Database connection is working

#### Image Upload Failures
```
Error: Cloudinary upload failed
```
**Solution**: Check Cloudinary configuration:
- API credentials are correct
- Upload presets are configured
- File size limits are appropriate

### Performance Optimization

- **Image Optimization**: Use Next.js Image component
- **Database Queries**: Implement proper indexing
- **Caching Strategy**: Use Redis for session storage (future enhancement)
- **CDN Integration**: Cloudinary handles image CDN

### Monitoring and Logging

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Console logging (Sentry integration planned)
- **Database Monitoring**: MongoDB Atlas monitoring tools
- **Uptime Monitoring**: Third-party uptime services recommended

## License

This project is proprietary software developed for Woxsen University School of Business. All rights reserved.

## Contact

For technical support, feature requests, or general inquiries:

- **Email**: airesearchcentre@woxsen.edu.in
- **Phone**: +91 9154674599
- **Address**: Woxsen University, Hyderabad, Telangana, India

---

**Version**: 1.0.0  
**Last Updated**: August 2025  
**Status**: Production Ready  
**Maintainer**: AI Research Centre, Woxsen University
