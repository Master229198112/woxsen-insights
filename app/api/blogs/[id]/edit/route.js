import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Research from '@/models/Research';
import Patent from '@/models/Patent';
import Achievement from '@/models/Achievement';
import Event from '@/models/Event';
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
    
    // Use the same populate pattern as the preview API
    const blog = await Blog.findById(id)
      .populate('author', 'name email department')
      .populate('researchData')
      .populate('patentData')
      .populate('achievementData')
      .populate('eventData');

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
    
    // Update basic blog fields
    const basicFields = ['title', 'content', 'excerpt', 'category', 'tags', 'featuredImage'];
    const changes = [];
    
    basicFields.forEach(field => {
      if (updateData[field] !== undefined) {
        const oldValue = blog[field];
        const newValue = updateData[field];
        
        // Handle array comparison for tags
        if (field === 'tags') {
          const oldTags = JSON.stringify((oldValue || []).sort());
          const newTags = JSON.stringify((newValue || []).sort());
          if (oldTags !== newTags) {
            changes.push(field);
            blog[field] = newValue;
          }
        } else if (oldValue !== newValue) {
          changes.push(field);
          blog[field] = newValue;
        }
      }
    });

    // Update category-specific data
    if (updateData.categoryData && typeof updateData.categoryData === 'object') {
      let categoryModel;
      let categoryChanges = [];
      
      switch (blog.category) {
        case 'research':
          categoryModel = Research;
          break;
        case 'patents':
          categoryModel = Patent;
          break;
        case 'achievements':
          categoryModel = Achievement;
          break;
        case 'events':
          categoryModel = Event;
          break;
      }

      if (categoryModel) {
        // Find existing category document or create new one
        let categoryDoc = await categoryModel.findOne({ basePost: blog._id });
        
        if (!categoryDoc) {
          // Create new category document
          categoryDoc = new categoryModel({
            basePost: blog._id,
            ...updateData.categoryData
          });
          categoryChanges.push('created category-specific data');
          
          // Save the new document and update the reference in blog
          await categoryDoc.save();
          
          // Update blog reference to the category document
          switch (blog.category) {
            case 'research':
              blog.researchData = categoryDoc._id;
              break;
            case 'patents':
              blog.patentData = categoryDoc._id;
              break;
            case 'achievements':
              blog.achievementData = categoryDoc._id;
              break;
            case 'events':
              blog.eventData = categoryDoc._id;
              break;
          }
        } else {
          // Update existing category document
          const categoryFields = Object.keys(updateData.categoryData);
          categoryFields.forEach(field => {
            const oldValue = categoryDoc[field];
            const newValue = updateData.categoryData[field];
            
            // Handle nested objects and arrays
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
              categoryChanges.push(field);
              categoryDoc[field] = newValue;
            }
          });
          
          if (categoryChanges.length > 0) {
            await categoryDoc.save();
          }
        }

        if (categoryChanges.length > 0) {
          changes.push(...categoryChanges.map(change => `${blog.category}: ${change}`));
        }
      }
    }

    // Add edit history entry if there are changes
    if (changes.length > 0) {
      if (!blog.editHistory) {
        blog.editHistory = [];
      }
      
      const editEntry = {
        version: (blog.editHistory.length || 0) + 1,
        editedBy: session.user.id,
        editedAt: new Date(),
        changes: `Updated: ${changes.join(', ')}`,
        isAdmin: isAdmin && !isAuthor
      };
      
      blog.editHistory.push(editEntry);
    }

    // If author is editing and blog was previously approved/published, set back to pending
    if (isAuthor && ['approved', 'published'].includes(blog.status) && changes.length > 0) {
      blog.status = 'pending';
      blog.isDraft = false;
      changes.push('status (back to pending for review)');
    }

    // If it's a draft being submitted for review
    if (updateData.submitForReview && blog.status === 'draft') {
      blog.status = 'pending';
      blog.isDraft = false;
      changes.push('status (submitted for review)');
    }

    await blog.save();

    // Send notification for admin edits
    if (isAdmin && !isAuthor && changes.length > 0) {
      try {
        await NotificationService.notifyBlogEdited(
          blog,
          session.user.id,
          changes.join(', ')
        );
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't fail the whole request if notification fails
      }
    }

    // Fetch updated blog with populated category data for response (same as preview API)
    const updatedBlog = await Blog.findById(id)
      .populate('author', 'name email department')
      .populate('researchData')
      .populate('patentData')
      .populate('achievementData')
      .populate('eventData');

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
