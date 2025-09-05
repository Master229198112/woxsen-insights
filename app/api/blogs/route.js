import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Settings from '@/models/Settings'; // ADD THIS IMPORT
import { authOptions } from '@/lib/auth-config';

// POST /api/blogs - Create new blog post
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // CHECK SETTINGS FOR AUTO-PUBLISH
    const settings = await Settings.getSettings();
    
    const { title, content, excerpt, category, tags, featuredImage } = await request.json();

    // Validation
    if (!title || !content || !excerpt || !category || !featuredImage) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // UPDATED BLOG CREATION WITH EXPLICIT SLUG GENERATION
    const blogData = {
      title,
      content,
      excerpt,
      author: session.user.id,
      category,
      tags: tags || [],
      featuredImage,
      status: settings.autoPublish ? 'published' : 'pending',
      publishedAt: settings.autoPublish ? new Date() : null,
    };
    
    // Generate unique slug before creating the blog
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)
      .replace(/^-+|-+$/g, '') || 'untitled-post';
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    blogData.slug = slug;

    const newBlog = new Blog(blogData);
    const savedBlog = await newBlog.save();
    const populatedBlog = await savedBlog.populate('author', 'name email department');

    const message = settings.autoPublish 
      ? 'Blog published successfully!' 
      : 'Blog submitted for review!';

    console.log(`📝 Blog "${title}" ${settings.autoPublish ? 'published' : 'submitted'} by ${session.user.name} with slug: ${slug}`);

    return NextResponse.json({ 
      blog: populatedBlog,
      message,
      autoPublished: settings.autoPublish
    }, { status: 201 });

  } catch (error) {
    console.error('Create blog error:', error);
    
    // Handle duplicate key errors specifically
    if (error.code === 11000 && error.keyPattern?.slug) {
      return NextResponse.json(
        { error: 'A blog with this title already exists. Please use a different title.' },
        { status: 400 }
      );
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: validationErrors.join('. ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/blogs - Get published blogs (existing functionality)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    
    let filter = { status: 'published' };
    if (category) {
      filter.category = category;
    }
    
    const blogs = await Blog.find(filter)
      .populate('author', 'name department')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Blog.countDocuments(filter);
    
    return NextResponse.json({
      blogs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        totalItems: total
      }
    });
    
  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
