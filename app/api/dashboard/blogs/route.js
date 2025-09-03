import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
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
    
    let filter = { author: session.user.id };
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
      author: session.user.id, 
      status: 'pending' 
    });
    const publishedCount = await Blog.countDocuments({ 
      author: session.user.id, 
      status: 'published' 
    });
    const totalCount = await Blog.countDocuments({ 
      author: session.user.id 
    });

    // Calculate total views
    const viewsResult = await Blog.aggregate([
      { $match: { author: session.user.id } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    console.log('📊 User stats - Pending:', pendingCount, 'Published:', publishedCount, 'Total:', totalCount, 'Views:', totalViews);

    return NextResponse.json({ 
      blogs,
      stats: {
        pending: pendingCount,
        published: publishedCount,
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
