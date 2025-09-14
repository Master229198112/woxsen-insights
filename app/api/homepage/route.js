import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('Homepage API: Starting...');
    await connectDB();
    console.log('Homepage API: Database connected');

    // Get featured posts
    const featuredPosts = await Blog.find({ 
      status: 'published', 
      isFeatured: true
    })
    .populate('author', 'name department username')
    .sort({ publishedAt: -1 })
    .limit(6);

    // Get recent posts
    const recentPosts = await Blog.find({ 
      status: 'published',
      _id: { $nin: featuredPosts.map(p => p._id) } // Exclude featured posts
    })
    .populate('author', 'name department username')
    .sort({ publishedAt: -1 })
    .limit(8);

    // Get posts by category for category showcase - INCLUDE ALL CATEGORIES
    const categories = [
      'research', 
      'achievements', 
      'events', 
      'patents',
      'case-studies',
      'blogs',
      'industry-collaborations'
    ];
    const categoryPosts = {};
    const categoryCounts = {};

    for (const category of categories) {
      // Get latest posts for this category
      categoryPosts[category] = await Blog.find({ 
        status: 'published', 
        category 
      })
      .populate('author', 'name department username')
      .sort({ publishedAt: -1 })
      .limit(4);

      // Get count for this category
      categoryCounts[category] = await Blog.countDocuments({ 
        status: 'published', 
        category 
      });
    }

    // Get overall stats
    const totalPublished = await Blog.countDocuments({ status: 'published' });
    const totalAuthors = await User.countDocuments({ 
      isApproved: true, 
      role: { $in: ['staff', 'admin'] }
    });
    
    // Calculate total views
    const viewsResult = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    console.log('Homepage API: Sending response with', {
      featuredPostsCount: featuredPosts.length,
      recentPostsCount: recentPosts.length,
      totalPublished
    });

    return NextResponse.json({
      featuredPosts,
      recentPosts,
      categoryPosts,
      stats: {
        totalPublished,
        totalAuthors,
        totalViews,
        categoryCounts
      }
    });

  } catch (error) {
    console.error('Homepage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}
