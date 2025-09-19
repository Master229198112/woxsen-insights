import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    console.log('🔍 Author profile API called');
    
    await connectDB();
    
    const { authorId } = await params;
    console.log('👤 Fetching profile for author:', authorId);

    let author;

    // First check if it's a valid ObjectId (for backward compatibility)
    if (authorId.match(/^[0-9a-fA-F]{24}$/)) {
      author = await User.findById(authorId).select(
        'name email department profileImage bio createdAt isApproved role username profileStats socialProfiles academicInfo privacySettings'
      );
      
      // Check if approved after finding by ID
      if (author && (!author.isApproved || !['staff', 'admin'].includes(author.role))) {
        author = null;
      }
    } else {
      // Try to find by slug (username or name-based)
      author = await User.findBySlug(authorId);
    }

    if (!author) {
      console.log('❌ Author not found');
      return NextResponse.json(
        { error: 'Author not found' },
        { status: 404 }
      );
    }

    // Get author's published posts
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const posts = await Blog.find({ 
      author: author._id, 
      status: 'published',
      rejectionReason: { $exists: false } // Exclude posts that have been rejected
    })
    .select('title excerpt featuredImage category publishedAt views slug')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get total count for pagination
    const totalPosts = await Blog.countDocuments({ 
      author: author._id, 
      status: 'published',
      rejectionReason: { $exists: false } // Exclude posts that have been rejected
    });

    // Get posts by category for this author
    const postsByCategory = await Blog.aggregate([
      { 
        $match: { 
          author: author._id, 
          status: 'published',
          rejectionReason: { $exists: false } // Exclude posts that have been rejected
        } 
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // FIXED: Use stored profileStats if available, otherwise calculate dynamically
    let stats;
    
    // Debug: Check if stored stats contain actual data
    console.log('📊 Raw profileStats from DB:', author.profileStats);
    
    if (author.profileStats && Object.keys(author.profileStats).length > 0) {
      // Use stored profile stats - but validate they're not all zeros
      const hasRealStats = author.profileStats.totalPosts > 0 || 
                          author.profileStats.totalPublications > 0 || 
                          author.profileStats.totalPatents > 0 || 
                          author.profileStats.totalAchievements > 0;
      
      if (hasRealStats) {
        console.log('📊 Using stored profile stats (with real data)');
        stats = {
        totalPosts: totalPosts, // Use actual approved count, not stored stats
        totalViews: await Blog.aggregate([
        { $match: { author: author._id, status: 'published', rejectionReason: { $exists: false } } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]).then(result => result.length > 0 ? result[0].totalViews : 0),
          memberSince: author.createdAt,
          categoriesWritten: postsByCategory.length,
          // Include additional stats if available
          totalPublications: author.profileStats.totalPublications || 0,
          totalPatents: author.profileStats.totalPatents || 0,
          totalAchievements: author.profileStats.totalAchievements || 0,
          totalEvents: author.profileStats.totalEvents || 0
        };
      } else {
        console.log('🔢 Stored stats are all zeros, calculating dynamically instead');
        stats = {
          totalPosts,
          totalViews: await Blog.aggregate([
            { $match: { author: author._id, status: 'published', rejectionReason: { $exists: false } } },
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
          ]).then(result => result.length > 0 ? result[0].totalViews : 0),
          memberSince: author.createdAt,
          categoriesWritten: postsByCategory.length
        };
      }
    } else {
      // Calculate stats dynamically (fallback)
      console.log('🔢 No stored stats found, calculating dynamically');
      stats = {
        totalPosts,
        totalViews: await Blog.aggregate([
          { $match: { author: author._id, status: 'published' } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]).then(result => result.length > 0 ? result[0].totalViews : 0),
        memberSince: author.createdAt,
        categoriesWritten: postsByCategory.length
      };
    }

    // Calculate pagination
    const totalPages = Math.ceil(totalPosts / limit);

    console.log('✅ Author profile data fetched successfully', { stats });

    return NextResponse.json({
      author: {
        _id: author._id,
        name: author.name,
        department: author.department,
        bio: author.bio,
        profileImage: author.profileImage,
        username: author.username,
        slug: author.getUrlSlug ? author.getUrlSlug() : author.username, // Handle if method doesn't exist
        // Include social profiles if user allows it
        socialProfiles: author.privacySettings?.showSocialProfiles !== false ? author.socialProfiles : {},
        // Include academic info
        academicInfo: author.academicInfo || {},
        // Include affiliations/work experience
        affiliations: author.affiliations || [],
        // Include email if user allows it
        email: author.privacySettings?.showEmail === true ? author.email : null
      },
      posts,
      stats,
      postsByCategory,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalItems: totalPosts
      }
    });

  } catch (error) {
    console.error('❌ Author profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
