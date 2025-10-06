import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

// Cache for 10 minutes
export const revalidate = 600;

export async function GET() {
  try {
    await connectDB();

    // Optimized parallel queries
    const [featuredPosts, recentPosts, totalPublished, totalAuthors, viewsResult] = await Promise.all([
      Blog.find({ status: 'published', isFeatured: true })
        .select('title excerpt slug author category featuredImage publishedAt views likes')
        .populate('author', 'name department username')
        .sort({ publishedAt: -1 })
        .limit(6)
        .lean(),
      
      Blog.find({ status: 'published' })
        .select('title excerpt slug author category featuredImage publishedAt views likes')
        .populate('author', 'name department username')
        .sort({ publishedAt: -1 })
        .limit(14) // Get extra to filter out featured
        .lean(),
      
      Blog.countDocuments({ status: 'published' }),
      
      User.countDocuments({ isApproved: true, role: { $in: ['staff', 'admin'] } }),
      
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ])
    ]);

    // Filter out featured posts from recent
    const featuredIds = new Set(featuredPosts.map(p => p._id.toString()));
    const filteredRecent = recentPosts.filter(p => !featuredIds.has(p._id.toString())).slice(0, 8);

    const categories = ['research', 'achievements', 'events', 'patents', 'case-studies', 'blogs', 'industry-collaborations'];
    
    // Optimized category queries in parallel
    const categoryResults = await Promise.all(
      categories.map(category => Promise.all([
        Blog.find({ status: 'published', category })
          .select('title excerpt slug author category featuredImage publishedAt views')
          .populate('author', 'name department username')
          .sort({ publishedAt: -1 })
          .limit(4)
          .lean(),
        Blog.countDocuments({ status: 'published', category })
      ]))
    );

    const categoryPosts = {};
    const categoryCounts = {};
    categories.forEach((category, index) => {
      categoryPosts[category] = categoryResults[index][0];
      categoryCounts[category] = categoryResults[index][1];
    });

    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    return NextResponse.json({
      featuredPosts,
      recentPosts: filteredRecent,
      categoryPosts,
      stats: {
        totalPublished,
        totalAuthors,
        totalViews,
        categoryCounts
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
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
