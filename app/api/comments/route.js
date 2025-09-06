import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';
import { NotificationService } from '@/lib/notifications';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { content, blogId, parentCommentId } = await request.json();

    if (!content || !blogId) {
      return NextResponse.json(
        { error: 'Content and blog ID are required' },
        { status: 400 }
      );
    }

    // Get the blog to send notifications
    const blog = await Blog.findById(blogId).populate('author');
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: session.user.id,
      blog: blogId,
      parentComment: parentCommentId || null,
      isApproved: true, // Auto-approve for now
    });

    // Populate author info for immediate display
    await comment.populate('author', 'name department');

    // Send notifications
    try {
      await NotificationService.notifyNewComment(comment, blog);
    } catch (notificationError) {
      console.error('Comment notification error:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      message: 'Comment posted successfully',
      comment
    });

  } catch (error) {
    console.error('Post comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
