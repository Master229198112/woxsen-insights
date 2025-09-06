import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';
import { NotificationService } from '@/lib/notifications';

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
    
    const { blogId } = await params;
    const { 
      status, 
      rejectionReason, 
      customRejectionReason,
      isHeroPost, 
      isFeatured,
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage
    } = await request.json();

    console.log('📝 Updating blog:', blogId, 'Status:', status);

    // Validate status (if provided)
    if (status && !['approved', 'published', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData = {};
    
    // Handle status updates
    if (status) {
      updateData.status = status;
      
      if (status === 'published') {
        updateData.publishedAt = new Date();
      }
    }
    
    // Handle content updates (admin editing)
    const contentFields = { title, content, excerpt, category, tags, featuredImage };
    const changes = [];
    
    Object.keys(contentFields).forEach(field => {
      if (contentFields[field] !== undefined) {
        updateData[field] = contentFields[field];
        changes.push(field);
      }
    });
    
    // Handle rejection with enhanced reasons
    if (status === 'rejected') {
      const finalRejectionReason = customRejectionReason || rejectionReason || 'Blog does not meet publication standards';
      updateData.rejectionReason = finalRejectionReason;
      
      // Add to rejection history
      updateData.$push = {
        rejectionHistory: {
          reason: rejectionReason || 'Other',
          customReason: customRejectionReason,
          rejectedBy: session.user.id,
          rejectedAt: new Date()
        }
      };
    }
    
    // Handle editorial flags
    if (isHeroPost !== undefined) {
      updateData.isHeroPost = isHeroPost;
    }
    
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }
    
    // Track admin edits
    if (changes.length > 0) {
      updateData.lastEditedBy = session.user.id;
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

    // Send notifications
    try {
      if (status) {
        let customMessage = null;
        if (status === 'rejected' && customRejectionReason) {
          customMessage = `Your blog "${blog.title}" was rejected. Reason: ${customRejectionReason}`;
        }
        
        await NotificationService.notifyBlogStatusChange(
          blog, 
          status, 
          session.user.id, 
          customMessage
        );
      }
      
      if (changes.length > 0) {
        await NotificationService.notifyBlogEdited(
          blog,
          session.user.id,
          changes.join(', ')
        );
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the request if notification fails
    }

    console.log('✅ Blog updated successfully:', blog.title);

    const action = status || (changes.length > 0 ? 'edited' : 'updated');
    return NextResponse.json({
      message: `Blog ${action} successfully`,
      blog,
      changes
    });

  } catch (error) {
    console.error('❌ Update blog error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
