import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import { authOptions } from '@/lib/auth-config';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user statistics
    const [totalUsers, pendingUsers, approvedUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: false }),
      User.countDocuments({ isApproved: true })
    ]);

    // Get blog statistics
    const [totalBlogs, pendingBlogs, publishedBlogs, rejectedBlogs] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'pending' }),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'rejected' })
    ]);

    // Get total views across all blogs
    const viewsResult = await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    // Get total comments
    const totalComments = await Comment.countDocuments();

    // Get recent pending blogs for the dashboard
    const recentPendingBlogs = await Blog.find({ status: 'pending' })
      .populate('author', 'name email department')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent pending users
    const recentPendingUsers = await User.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email department createdAt');

    // Get monthly blog creation stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBlogStats = await Blog.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get category distribution
    const categoryStats = await Blog.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get top authors
    const topAuthors = await Blog.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$author',
          blogCount: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          name: '$author.name',
          email: '$author.email',
          department: '$author.department',
          blogCount: 1,
          totalViews: 1
        }
      },
      {
        $sort: { blogCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        pending: pendingUsers,
        approved: approvedUsers
      },
      blogs: {
        total: totalBlogs,
        pending: pendingBlogs,
        published: publishedBlogs,
        rejected: rejectedBlogs
      },
      engagement: {
        totalViews,
        totalComments,
        averageViewsPerBlog: publishedBlogs > 0 ? Math.round(totalViews / publishedBlogs) : 0
      },
      recentActivity: {
        pendingBlogs: recentPendingBlogs,
        pendingUsers: recentPendingUsers
      },
      analytics: {
        monthlyBlogStats,
        categoryStats,
        topAuthors
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
