import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
    .replace(/-+$/, '');
}

export async function GET(request) {
  try {
    await connectDB();

    // Find all blogs with null slugs
    const blogsWithoutSlugs = await Blog.find({
      $or: [
        { slug: null },
        { slug: { $exists: false } },
        { slug: '' }
      ]
    });

    console.log(`Found ${blogsWithoutSlugs.length} blogs without slugs`);

    const fixed = [];

    for (let blog of blogsWithoutSlugs) {
      let baseSlug = 'untitled';
      
      if (blog.title) {
        baseSlug = generateSlug(blog.title);
      }
      
      let slug = baseSlug;
      let counter = 1;
      
      // Make slug unique
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Update the blog
      await Blog.findByIdAndUpdate(blog._id, { slug });
      fixed.push({ 
        id: blog._id, 
        title: blog.title || 'Untitled', 
        slug,
        status: blog.status 
      });
    }

    return NextResponse.json({
      message: `Fixed ${fixed.length} blogs`,
      fixed,
      success: true
    });

  } catch (error) {
    console.error('Fix slugs error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}
