import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
    .replace(/-+$/, '');
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find all published blogs without slugs
    const blogsWithoutSlugs = await Blog.find({
      status: 'published',
      $or: [
        { slug: null },
        { slug: { $exists: false } },
        { slug: '' }
      ]
    });

    const fixed = [];

    for (let blog of blogsWithoutSlugs) {
      const baseSlug = generateSlug(blog.title);
      let slug = baseSlug;
      let counter = 1;
      
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      await Blog.findByIdAndUpdate(blog._id, { slug });
      fixed.push({ title: blog.title, slug });
    }

    return NextResponse.json({
      message: `Fixed ${fixed.length} blogs`,
      fixed
    });

  } catch (error) {
    console.error('Fix slugs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
