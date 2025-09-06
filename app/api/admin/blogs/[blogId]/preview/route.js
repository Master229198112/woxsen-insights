import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import { authOptions } from '@/lib/auth-config';

// GET /api/admin/blogs/[blogId]/preview - Get blog preview for admin
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { blogId } = await params;
    
    const blog = await Blog.findById(blogId)
      .populate('author', 'name email department profileImage bio');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Get comments for the blog (if any)
    const comments = await Comment.find({ blog: blogId, isApproved: true })
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(5); // Limit to recent 5 comments for preview

    // Get related blogs (same category)
    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blogId },
      status: 'published'
    })
    .select('title slug featuredImage author category createdAt views')
    .populate('author', 'name')
    .sort({ views: -1 })
    .limit(3);

    return NextResponse.json({
      blog,
      comments,
      relatedBlogs,
      commentsCount: await Comment.countDocuments({ blog: blogId, isApproved: true }),
      previewMode: true
    });

  } catch (error) {
    console.error('Admin blog preview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
