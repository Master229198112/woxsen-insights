import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'newest';
    const author = searchParams.get('author') || '';
    const tag = searchParams.get('tag') || '';

    // Validate category
    const validCategories = ['research', 'achievements', 'publications', 'events', 'patents'];
    if (!validCategories.includes(slug)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 404 }
      );
    }

    // Build query
    let query = {
      status: 'published',
      category: slug
    };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Add author filter
    if (author) {
      const authorDoc = await User.findOne({ 
        name: { $regex: author, $options: 'i' } 
      });
      if (authorDoc) {
        query.author = authorDoc._id;
      }
    }

    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'oldest':
        sortCriteria = { publishedAt: 1 };
        break;
      case 'popular':
        sortCriteria = { views: -1 };
        break;
      case 'title':
        sortCriteria = { title: 1 };
        break;
      default: // newest
        sortCriteria = { publishedAt: -1 };
    }

    // Execute query with pagination
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name department email')
        .sort(sortCriteria)
        .limit(limit)
        .skip((page - 1) * limit),
      Blog.countDocuments(query)
    ]);

    // Get category statistics
    const categoryStats = await Blog.aggregate([
      { $match: { status: 'published', category: slug } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$views' },
          authors: { $addToSet: '$author' }
        }
      }
    ]);

    const stats = categoryStats.length > 0 ? {
      totalPosts: categoryStats[0].totalPosts,
      totalViews: categoryStats[0].totalViews,
      totalAuthors: categoryStats[0].authors.length
    } : { totalPosts: 0, totalViews: 0, totalAuthors: 0 };

    // Get all authors in this category
    const authorsInCategory = await Blog.aggregate([
      { $match: { status: 'published', category: slug } },
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $project: { name: '$author.name', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get all tags in this category
    const tagsInCategory = await Blog.aggregate([
      { $match: { status: 'published', category: slug } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Get featured posts in this category
    const featuredPosts = await Blog.find({
      status: 'published',
      category: slug,
      isFeatured: true
    })
    .populate('author', 'name department')
    .sort({ publishedAt: -1 })
    .limit(3);

    return NextResponse.json({
      blogs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        totalItems: total
      },
      stats,
      featuredPosts,
      filters: {
        authors: authorsInCategory,
        tags: tagsInCategory.map(t => ({ name: t._id, count: t.count }))
      },
      category: {
        slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1)
      }
    });

  } catch (error) {
    console.error('Category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
