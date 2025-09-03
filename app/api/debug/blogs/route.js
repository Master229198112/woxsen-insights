import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
    }

    await connectDB();
    
    const allBlogs = await Blog.find({}).populate('author', 'name email department');
    const totalBlogs = await Blog.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });
    
    console.log('🔍 Debug - Total blogs:', totalBlogs);
    console.log('📋 All blogs:', allBlogs.map(b => ({ 
      title: b.title, 
      author: b.author?.name, 
      status: b.status,
      category: b.category
    })));
    
    return NextResponse.json({
      message: 'Blog debug successful',
      totalBlogs,
      pendingBlogs,
      publishedBlogs,
      blogs: allBlogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        status: blog.status,
        category: blog.category,
        author: blog.author?.name || 'Unknown',
        createdAt: blog.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
