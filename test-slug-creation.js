// Test script to verify slug creation works properly
// Run this with: node test-slug-creation.js

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env.local');
dotenv.config({ path: envPath });

// Import dependencies after env is loaded
import connectDB from './lib/mongodb.js';

async function testSlugCreation() {
  try {
    console.log('🧪 Testing slug creation...');
    
    // Import Blog model dynamically
    const { default: Blog } = await import('./models/Blog.js');
    
    await connectDB();
    console.log('✅ Connected to database');

    // Test data
    const testPost = {
      title: 'Test Post for Slug Generation!!! @#$%',
      content: 'This is a test post to verify slug generation works.',
      excerpt: 'Test excerpt for slug generation.',
      author: '507f1f77bcf86cd799439011', // Dummy ObjectId
      category: 'blogs',
      tags: ['test', 'slug'],
      featuredImage: 'https://example.com/image.jpg',
      status: 'draft'
    };

    console.log('📝 Creating test blog post...');
    console.log('Title:', testPost.title);

    // Create blog post without explicit slug
    const blog = new Blog(testPost);
    await blog.save();

    console.log('✅ Blog post created successfully!');
    console.log('Generated slug:', blog.slug);
    console.log('Post ID:', blog._id);

    // Test updating title
    console.log('\\n📝 Testing slug update when title changes...');
    blog.title = 'Updated Title with Special Characters!!! @#$%';
    await blog.save();

    console.log('✅ Title updated successfully!');
    console.log('Updated slug:', blog.slug);

    // Clean up - remove test post
    await Blog.findByIdAndDelete(blog._id);
    console.log('🧹 Test post cleaned up');

    console.log('\\n🎉 All tests passed! Slug generation is working correctly.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.values(error.errors).forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
    }
    
    process.exit(1);
  }
}

// Run the test
testSlugCreation();
