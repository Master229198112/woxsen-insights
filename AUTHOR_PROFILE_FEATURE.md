# Author Profile Feature Implementation

## Overview

This implementation adds clickable author names and user-friendly URLs for author profiles. Authors can now be accessed via clean URLs using their username or name instead of MongoDB ObjectIDs.

## Features Implemented

### 1. Username Field in User Model
- Added `username` field to User model with validation
- Username is unique, optional, and follows format constraints
- Supports automatic generation from user names

### 2. Clean Author Profile URLs
**Old Format**: `/author/507f1f77bcf86cd799439011` (MongoDB ObjectID)
**New Format**: `/author/john.smith` or `/author/john-smith` (username or name-based)

### 3. Backward Compatibility
- Old ObjectID-based URLs still work
- Automatic fallback system ensures no broken links

### 4. Clickable Author Names
- Author names are clickable throughout the site
- Automatic URL generation based on available data

## URL Generation Logic

The system follows this priority order:

1. **Username** (if available): `username.toLowerCase()`
2. **Name-based slug**: `name.toLowerCase().replace(/\s+/g, '-')`
3. **ObjectID fallback**: MongoDB ObjectID (for backward compatibility)

## Files Modified

### Models
- `models/User.js`: Added username field and URL generation methods

### API Routes
- `app/api/author/[authorId]/route.js`: Updated to handle both IDs and slugs
- `app/api/homepage/route.js`: Added username to author population
- `app/api/blogs/[id]/route.js`: Added username to author population
- `app/api/category/[slug]/route.js`: Added username to author population

### Components
- `components/ui/AuthorLink.jsx`: Updated to generate proper URLs

### Admin Tools
- `app/api/admin/generate-usernames/route.js`: API for username generation
- `app/admin/author-urls/page.jsx`: Admin interface for managing author URLs
- `scripts/generate-usernames.js`: Command-line migration script

## Usage

### For Users
Author names are automatically clickable throughout the site. No changes needed in user behavior.

### For Admins

#### Generate Usernames
1. **Admin Panel**: Visit `/admin/author-urls` to manage author URLs
2. **API Endpoint**: `POST /api/admin/generate-usernames`
3. **Command Line**: Run `node scripts/generate-usernames.js`

#### Individual Username Generation
```javascript
// API call to generate username for specific user
POST /api/admin/generate-usernames
{
  \"userId\": \"507f1f77bcf86cd799439011\"
}
```

#### Bulk Username Generation
```javascript
// API call to generate usernames for all users without them
POST /api/admin/generate-usernames
{}
```

## Implementation Details

### User Model Methods

```javascript
// Get URL slug for user
user.getUrlSlug() // Returns username or generated slug

// Generate unique username from name
await user.generateUniqueUsername() // Returns unique username
```

### API Route Logic

```javascript
// In API routes, the system automatically detects:
if (authorId.match(/^[0-9a-fA-F]{24}$/)) {
  // It's a MongoDB ObjectId - use findById
} else {
  // It's a slug - use findBySlug
}
```

### AuthorLink Component Usage

```jsx
// Simple usage - automatically generates proper URL
<AuthorLink author={authorObject} />

// With additional styling
<AuthorLink 
  author={authorObject} 
  className=\"text-blue-600\" 
  showDepartment={true} 
/>
```

## Migration Guide

### For Existing Projects

1. **Run Migration Script**:
   ```bash
   cd scripts
   node generate-usernames.js
   ```

2. **Or Use Admin Panel**:
   - Navigate to `/admin/author-urls`
   - Click \"Generate All Usernames\"

3. **Verify Implementation**:
   - Check that author names are clickable
   - Test both old and new URL formats
   - Ensure no broken links

### Database Changes

The User model now includes:
```javascript
{
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    // ... validation rules
  }
}
```

## URL Examples

| User | Username | Old URL | New URL |
|------|----------|---------|---------|
| John Smith | john.smith | `/author/507f...` | `/author/john.smith` |
| Dr. Sarah Wilson | sarah.wilson | `/author/608a...` | `/author/sarah.wilson` |
| Mike Johnson | (none) | `/author/709b...` | `/author/mike-johnson` |

## Testing

### Test Cases

1. **New URLs Work**: `/author/john.smith` loads profile
2. **Old URLs Work**: `/author/507f1f77bcf86cd799439011` still works
3. **Name-based Slugs**: Users without usernames get name-based URLs
4. **Clickable Links**: Author names link to correct profiles
5. **Unique Usernames**: No duplicate usernames in system

### Manual Testing

1. Visit homepage and click author names
2. Test both old and new URL formats
3. Check author profile pages load correctly
4. Verify pagination works on author profiles
5. Test username generation in admin panel

## Troubleshooting

### Common Issues

1. **\"Author not found\" error**:
   - Check if user has `isApproved: true`
   - Verify user role is 'staff' or 'admin'

2. **Links using ObjectIDs instead of usernames**:
   - Ensure API routes populate 'username' in author data
   - Check AuthorLink component receives complete author object

3. **Duplicate username errors**:
   - Run username generation script to resolve conflicts
   - Check unique constraints in database

### Debug Steps

1. Check browser console for errors
2. Verify API responses include username field
3. Test individual components in isolation
4. Use admin panel to monitor username generation

## Future Enhancements

### Planned Features
- User-customizable usernames
- Social media integration in profiles
- Author profile editing interface
- Enhanced analytics for author pages

### Performance Optimizations
- Add indexes for username lookups
- Implement caching for author profiles
- Optimize database queries

## Security Considerations

- Username validation prevents injection attacks
- Unique constraints prevent conflicts
- Admin-only access to username generation
- Backward compatibility maintains existing security

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all files are properly updated
3. Test in development environment first
4. Check database constraints and indexes
