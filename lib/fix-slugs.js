// Database cleanup script for existing blogs with null slugs
// Run this once to fix existing blogs

import connectDB from './mongodb.js';
import Blog from '../models/Blog.js';

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 50) // Limit length
    .replace(/-+$/, ''); // Remove trailing hyphens
}

async function fixNullSlugs() {
  try {
    await connectDB();
    console.log('🔧 Starting slug fix process...');

    // Find all published blogs without slugs
    const blogsWithoutSlugs = await Blog.find({
      status: 'published',
      $or: [
        { slug: null },
        { slug: { $exists: false } },
        { slug: '' }
      ]
    });

    console.log(`🔍 Found ${blogsWithoutSlugs.length} blogs without slugs`);

    for (let blog of blogsWithoutSlugs) {
      const baseSlug = generateSlug(blog.title);
      let slug = baseSlug;
      let counter = 1;
      
      // Check for existing slugs and make unique
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Update the blog with new slug
      await Blog.findByIdAndUpdate(blog._id, { slug });
      console.log(`✅ Updated blog "${blog.title}" with slug: ${slug}`);
    }

    console.log('🎉 Slug fix process completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing slugs:', error);
    process.exit(1);
  }
}

// Run the fix
fixNullSlugs();
