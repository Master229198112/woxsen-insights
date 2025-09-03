import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import User from '@/models/User'; // IMPORTANT: Import User model

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15
    const { id } = await params;
    
    await connectDB();
    
    // Find the blog and populate author info
    const blog = await Blog.findById(id)
      .populate('author', 'name email department profileImage');
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Only show published blogs to public (unless it's the author viewing their own)
    if (blog.status !== 'published') {
      return NextResponse.json(
        { error: 'Blog not available' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    // Get comments for this blog
    const comments = await Comment.find({ 
      blog: id, 
      isApproved: true 
    })
    .populate('author', 'name department')
    .sort({ createdAt: -1 });
    
    // Get related blogs (same category, excluding current blog)
    const relatedBlogs = await Blog.find({
      category: blog.category,
      status: 'published',
      _id: { $ne: id }
    })
    .populate('author', 'name department')
    .limit(3)
    .sort({ publishedAt: -1 });
    
    return NextResponse.json({
      blog: {
        ...blog.toObject(),
        views: blog.views + 1 // Return incremented count
      },
      comments,
      relatedBlogs
    });
    
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
