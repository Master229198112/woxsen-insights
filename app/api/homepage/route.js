import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Get hero post (most recent hero post or latest published)
    let heroPost = await Blog.findOne({ 
      status: 'published', 
      isHeroPost: true 
    })
    .populate('author', 'name department')
    .sort({ publishedAt: -1 });

    // If no hero post, get the latest published post
    if (!heroPost) {
      heroPost = await Blog.findOne({ status: 'published' })
        .populate('author', 'name department')
        .sort({ publishedAt: -1 });
    }

    // Get featured posts (excluding hero post)
    const featuredPosts = await Blog.find({ 
      status: 'published', 
      isFeatured: true,
      _id: { $ne: heroPost?._id }
    })
    .populate('author', 'name department')
    .sort({ publishedAt: -1 })
    .limit(6);

    // Get recent posts (excluding hero and featured)
    const excludeIds = [heroPost?._id, ...featuredPosts.map(p => p._id)].filter(Boolean);
    const recentPosts = await Blog.find({ 
      status: 'published',
      _id: { $nin: excludeIds }
    })
    .populate('author', 'name department')
    .sort({ publishedAt: -1 })
    .limit(8);

    // Get posts by category for category showcase
    const categories = ['research', 'achievements', 'publications', 'events', 'patents'];
    const categoryPosts = {};
    const categoryCounts = {};

    for (const category of categories) {
      // Get latest posts for this category
      categoryPosts[category] = await Blog.find({ 
        status: 'published', 
        category 
      })
      .populate('author', 'name department')
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

    return NextResponse.json({
      heroPost,
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
