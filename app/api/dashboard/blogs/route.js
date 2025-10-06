import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth-config';

// Cache for 2 minutes since dashboard data changes frequently
export const revalidate = 120;

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    let filter = { author: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Parallel queries for better performance
    const [blogs, counts, viewsResult] = await Promise.all([
      Blog.find(filter)
        .select('title excerpt slug category status featuredImage publishedAt views likes createdAt rejectionReason')
        .populate('author', 'name email department')
        .sort({ createdAt: -1 })
        .lean(),
      
      Promise.all([
        Blog.countDocuments({ author: userId, status: 'pending' }),
        Blog.countDocuments({ author: userId, status: 'published' }),
        Blog.countDocuments({ author: userId, status: 'draft' }),
        Blog.countDocuments({ author: userId, status: 'rejected' }),
        Blog.countDocuments({ author: userId })
      ]),
      
      Blog.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ])
    ]);

    const [pendingCount, publishedCount, draftCount, rejectedCount, totalCount] = counts;
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    return NextResponse.json({ 
      blogs,
      stats: {
        pending: pendingCount,
        published: publishedCount,
        draft: draftCount,
        rejected: rejectedCount,
        total: totalCount,
        totalViews
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=120, stale-while-revalidate=240'
      }
    });

  } catch (error) {
    console.error('Get user blogs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
