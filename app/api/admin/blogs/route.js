import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { authOptions } from '@/lib/auth-config';

// GET /api/admin/blogs - Get all blogs for admin review
export async function GET(request) {
  try {
    console.log('🔍 Admin blogs API called');
    
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.email, 'Role:', session?.user?.role);
    
    if (!session || session.user.role !== 'admin') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('🗄️ Connecting to database...');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    console.log('📊 Filter status:', status);
    
    let filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    console.log('🔍 Query filter:', filter);

    const blogs = await Blog.find(filter)
      .populate('author', 'name email department')
      .sort({ createdAt: -1 });

    console.log('📝 Found blogs:', blogs.length);

    // Get counts for different statuses
    const pendingCount = await Blog.countDocuments({ status: 'pending' });
    const publishedCount = await Blog.countDocuments({ status: 'published' });
    const totalCount = await Blog.countDocuments();

    console.log('📊 Counts - Pending:', pendingCount, 'Published:', publishedCount, 'Total:', totalCount);

    return NextResponse.json({ 
      blogs,
      counts: {
        pending: pendingCount,
        published: publishedCount,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('❌ Get blogs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
