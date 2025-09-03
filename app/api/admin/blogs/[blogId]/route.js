import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';

export async function PATCH(request, { params }) {
  try {
    console.log('🔍 Update blog API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { blogId } = params;
    const { status, rejectionReason, isHeroPost, isFeatured } = await request.json();

    console.log('📝 Updating blog:', blogId, 'Status:', status);

    // Validate status
    if (!['approved', 'published', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData = { status };
    
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    if (isHeroPost !== undefined) {
      updateData.isHeroPost = isHeroPost;
    }
    
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true }
    ).populate('author', 'name email department');

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    console.log('✅ Blog updated successfully:', blog.title);

    return NextResponse.json({
      message: `Blog ${status} successfully`,
      blog
    });

  } catch (error) {
    console.error('❌ Update blog error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
