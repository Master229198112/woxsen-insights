import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params; // This will now be either ID or slug

    let blog;
    
    // Try to find by slug first, then by ID
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId format
      blog = await Blog.findById(id).populate('author', 'name email department username');
    } else {
      // It's a slug
      blog = await Blog.findOne({ slug: id }).populate('author', 'name email department username');
    }
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Only return published blogs (except for authors and admins)
    if (blog.status !== 'published') {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Increment views atomically
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    blog.views += 1; // Update the current object for response

    console.log('Blog found with category:', blog.category);
    console.log('Blog has researchData:', !!blog.researchData);
    console.log('Blog has patentData:', !!blog.patentData);
    console.log('Blog has achievementData:', !!blog.achievementData);
    console.log('Blog has eventData:', !!blog.eventData);

    // Get approved comments for this blog
    const comments = await Comment.find({
      blog: blog._id,
      isApproved: true
    })
    .populate('author', 'name email department username')
    .sort({ createdAt: -1 })
    .limit(50);

    // Get related blogs from same category (excluding current blog)
    const relatedBlogs = await Blog.find({
      category: blog.category,
      status: 'published',
      _id: { $ne: blog._id }
    })
    .populate('author', 'name department username')
    .sort({ publishedAt: -1 })
    .limit(4);

    return NextResponse.json({
      blog,
      comments,
      relatedBlogs
    });

  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
