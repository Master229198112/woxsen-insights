import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import Research from '@/models/Research';
import Patent from '@/models/Patent';
import Achievement from '@/models/Achievement';
import Event from '@/models/Event';

// Cache for 10 minutes
export const revalidate = 600;

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params; // This will now be either ID or slug

    let blog;
    
    // Find by slug or ID with optimized queries
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(id)
        .select('title content excerpt author category tags featuredImage publishedAt views likes slug status researchData patentData achievementData eventData')
        .populate('author', 'name email department username profileImage')
        .populate('researchData')
        .populate('patentData')
        .populate('achievementData')
        .populate('eventData')
        .lean();
    } else {
      blog = await Blog.findOne({ slug: id })
        .select('title content excerpt author category tags featuredImage publishedAt views likes slug status researchData patentData achievementData eventData')
        .populate('author', 'name email department username profileImage')
        .populate('researchData')
        .populate('patentData')
        .populate('achievementData')
        .populate('eventData')
        .lean();
    }
    
    if (!blog || blog.status !== 'published') {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Increment views asynchronously (don't wait)
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

    // Parallel queries for better performance
    const [comments, relatedBlogs] = await Promise.all([
      Comment.find({
        blog: blog._id,
        isApproved: true
      })
      .select('content author createdAt')
      .populate('author', 'name email department username')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
      
      Blog.find({
        category: blog.category,
        status: 'published',
        _id: { $ne: blog._id }
      })
      .select('title excerpt slug author category featuredImage publishedAt views')
      .populate('author', 'name department username')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean()
    ]);

    return NextResponse.json({
      blog,
      comments,
      relatedBlogs
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    });

  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
