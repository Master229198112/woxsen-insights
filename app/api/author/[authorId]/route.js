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
        'name email department profileImage bio createdAt isApproved role username'
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
      status: 'published' 
    })
    .select('title excerpt featuredImage category publishedAt views slug')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get total count for pagination
    const totalPosts = await Blog.countDocuments({ 
      author: author._id, 
      status: 'published' 
    });

    // Get posts by category for this author
    const postsByCategory = await Blog.aggregate([
      { 
        $match: { 
          author: author._id, 
          status: 'published' 
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

    // Get author stats
    const stats = {
      totalPosts,
      totalViews: await Blog.aggregate([
        { $match: { author: author._id, status: 'published' } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]).then(result => result.length > 0 ? result[0].totalViews : 0),
      memberSince: author.createdAt,
      categoriesWritten: postsByCategory.length
    };

    // Calculate pagination
    const totalPages = Math.ceil(totalPosts / limit);

    console.log('✅ Author profile data fetched successfully');

    return NextResponse.json({
      author: {
        _id: author._id,
        name: author.name,
        department: author.department,
        bio: author.bio,
        profileImage: author.profileImage,
        username: author.username,
        slug: author.getUrlSlug() // This will be the URL slug to use
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
