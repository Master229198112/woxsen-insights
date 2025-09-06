import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth-config';

export async function GET(request) {
  try {
    console.log('🔍 User blogs API called');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('👤 User:', session.user.email);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // FIX: Convert session.user.id to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    let filter = { author: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    console.log('🔍 Query filter:', filter);

    const blogs = await Blog.find(filter)
      .populate('author', 'name email department')
      .sort({ createdAt: -1 });

    console.log('📝 Found user blogs:', blogs.length);

    // Get counts for user's blogs
    const pendingCount = await Blog.countDocuments({ 
      author: userId, 
      status: 'pending' 
    });
    const publishedCount = await Blog.countDocuments({ 
      author: userId, 
      status: 'published' 
    });
    const draftCount = await Blog.countDocuments({ 
      author: userId, 
      status: 'draft' 
    });
    const rejectedCount = await Blog.countDocuments({ 
      author: userId, 
      status: 'rejected' 
    });
    const totalCount = await Blog.countDocuments({ 
      author: userId 
    });

    // FIX: Calculate total views with proper ObjectId matching
    const viewsResult = await Blog.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    console.log('📊 User stats - Pending:', pendingCount, 'Published:', publishedCount, 'Drafts:', draftCount, 'Rejected:', rejectedCount, 'Total:', totalCount, 'Views:', totalViews);

    return NextResponse.json({ 
      blogs,
      stats: {
        pending: pendingCount,
        published: publishedCount,
        draft: draftCount,
        rejected: rejectedCount,
        total: totalCount,
        totalViews: totalViews
      }
    });

  } catch (error) {
    console.error('❌ Get user blogs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
