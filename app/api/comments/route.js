import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { authOptions } from '@/lib/auth-config';

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
    
    const { content, blogId } = await request.json();

    if (!content || !blogId) {
      return NextResponse.json(
        { error: 'Content and blog ID are required' },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: session.user.id,
      blog: blogId,
      isApproved: true, // Auto-approve for now
    });

    // Populate author info for immediate display
    await comment.populate('author', 'name department');

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
