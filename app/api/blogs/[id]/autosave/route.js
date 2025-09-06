import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';

// POST /api/blogs/[id]/autosave - Auto-save blog draft
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const { title, content, excerpt } = await request.json();
    
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAuthor = blog.author.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Auto-save the data
    await blog.autoSave({
      title: title || blog.title,
      content: content || blog.content,
      excerpt: excerpt || blog.excerpt
    });

    return NextResponse.json({
      message: 'Auto-saved successfully',
      lastSaved: new Date()
    });

  } catch (error) {
    console.error('Auto-save error:', error);
    return NextResponse.json(
      { error: 'Auto-save failed' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[id]/autosave - Get auto-saved data
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAuthor = blog.author.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      autoSaveData: blog.autoSaveData || null
    });

  } catch (error) {
    console.error('Get auto-save error:', error);
    return NextResponse.json(
      { error: 'Failed to get auto-save data' },
      { status: 500 }
    );
  }
}
