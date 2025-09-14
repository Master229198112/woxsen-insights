/**
 * Migration Script: Merge 'publications' category into 'research'
 * 
 * This script updates all blog posts with category 'publications' to use 'research' instead.
 * Run this ONCE after deploying the category changes.
 * 
 * Usage: node scripts/migrate-categories.js
 */

const mongoose = require('mongoose');

// Import the Blog model
const Blog = require('../models/Blog');

async function migratePuplicationsToResearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/woxsen-insights');
    console.log('✅ Connected to MongoDB');

    // Find all blogs with 'publications' category
    const publicationBlogs = await Blog.find({ category: 'publications' });
    console.log(`📊 Found ${publicationBlogs.length} blog(s) with 'publications' category`);

    if (publicationBlogs.length === 0) {
      console.log('✅ No migration needed - no blogs found with "publications" category');
      return;
    }

    // Update all 'publications' to 'research'
    const result = await Blog.updateMany(
      { category: 'publications' },
      { 
        $set: { category: 'research' },
        $currentDate: { updatedAt: true }
      }
    );

    console.log(`✅ Successfully migrated ${result.modifiedCount} blog(s) from 'publications' to 'research'`);

    // Verify the migration
    const remainingPublications = await Blog.countDocuments({ category: 'publications' });
    const totalResearch = await Blog.countDocuments({ category: 'research' });
    
    console.log(`📊 Verification:`);
    console.log(`   - Remaining 'publications': ${remainingPublications}`);
    console.log(`   - Total 'research': ${totalResearch}`);

    if (remainingPublications === 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.warn('⚠️  Warning: Some publications may not have been migrated');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  console.log('🚀 Starting category migration...');
  migratePuplicationsToResearch();
}

module.exports = migratePuplicationsToResearch;