import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;

    // Find the blog and increment views atomically
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, // Increment views by 1
      { new: true } // Return updated document
    ).populate('author', 'name email department');
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Only return published blogs (except for authors and admins)
    if (blog.status !== 'published') {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Get approved comments for this blog
    const comments = await Comment.find({
      blog: id,
      isApproved: true
    })
    .populate('author', 'name email department')
    .sort({ createdAt: -1 })
    .limit(50); // Limit comments to prevent large responses

    // Get related blogs from same category (excluding current blog)
    const relatedBlogs = await Blog.find({
      category: blog.category,
      status: 'published',
      _id: { $ne: id }
    })
    .populate('author', 'name department')
    .sort({ publishedAt: -1 })
    .limit(4);

    return NextResponse.json({
      blog,
      comments,
      relatedBlogs
    });

  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
