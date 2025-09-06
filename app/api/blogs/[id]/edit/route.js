import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';
import { NotificationService } from '@/lib/notifications';

// GET /api/blogs/[id]/edit - Get blog for editing
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
    const blog = await Blog.findById(id)
      .populate('author', 'name email department');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAuthor = blog.author._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Check if blog can be edited
    const canEdit = (
      blog.status === 'draft' || 
      blog.status === 'rejected' || 
      (isAdmin && ['approved', 'published'].includes(blog.status))
    );

    if (!canEdit && !isAdmin) {
      return NextResponse.json(
        { error: 'Blog cannot be edited in current status' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      blog,
      canEdit,
      permissions: {
        isAuthor,
        isAdmin
      }
    });

  } catch (error) {
    console.error('Get blog for edit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id]/edit - Update blog
export async function PUT(request, { params }) {
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
    const updateData = await request.json();
    
    const blog = await Blog.findById(id).populate('author', 'name email');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAuthor = blog.author._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Check if blog can be edited
    const canEdit = (
      blog.status === 'draft' || 
      blog.status === 'rejected' || 
      (isAdmin && ['approved', 'published'].includes(blog.status))
    );

    if (!canEdit && !isAdmin) {
      return NextResponse.json(
        { error: 'Blog cannot be edited in current status' },
        { status: 400 }
      );
    }

    // Track who is editing
    blog.lastEditedBy = session.user.id;
    
    // Update fields
    const allowedFields = ['title', 'content', 'excerpt', 'category', 'tags', 'featuredImage'];
    const changes = [];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== blog[field]) {
        changes.push(field);
        blog[field] = updateData[field];
      }
    });

    // If author is editing and blog was previously approved/published, set back to pending
    if (isAuthor && ['approved', 'published'].includes(blog.status) && changes.length > 0) {
      blog.status = 'pending';
      blog.isDraft = false;
    }

    // If it's a draft being submitted for review
    if (updateData.submitForReview && blog.status === 'draft') {
      blog.status = 'pending';
      blog.isDraft = false;
    }

    await blog.save();

    // Send notification for admin edits
    if (isAdmin && !isAuthor && changes.length > 0) {
      await NotificationService.notifyBlogEdited(
        blog,
        session.user.id,
        changes.join(', ')
      );
    }

    const updatedBlog = await Blog.findById(id)
      .populate('author', 'name email department');

    return NextResponse.json({
      message: 'Blog updated successfully',
      blog: updatedBlog,
      changes
    });

  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
