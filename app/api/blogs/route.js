import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';

// GET /api/admin/blogs - Get all blogs for admin review
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    
    let filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'name email department')
      .sort({ createdAt: -1 });

    // Get counts for different statuses
    const pendingCount = await Blog.countDocuments({ status: 'pending' });
    const publishedCount = await Blog.countDocuments({ status: 'published' });
    const totalCount = await Blog.countDocuments();

    return NextResponse.json({ 
      blogs,
      counts: {
        pending: pendingCount,
        published: publishedCount,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
