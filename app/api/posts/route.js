import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Research from '@/models/Research';
import Patent from '@/models/Patent';
import Achievement from '@/models/Achievement';
import Event from '@/models/Event';
import User from '@/models/User';

// Helper function to generate slug
function generateSlug(title) {
  if (!title || typeof title !== 'string') {
    return `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters but keep hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 50) // Limit length
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // If slug is empty after processing, use fallback
  if (!slug || slug.length === 0) {
    slug = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return slug;
}

// Function to ensure unique slug
async function generateUniqueSlug(title, excludeId = null) {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;
  
  // Check for existing slugs and make unique
  let existingBlog = await Blog.findOne({ 
    slug, 
    ...(excludeId && { _id: { $ne: excludeId } })
  });
  
  while (existingBlog) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    existingBlog = await Blog.findOne({ 
      slug, 
      ...(excludeId && { _id: { $ne: excludeId } })
    });
  }
  
  return slug;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const data = await request.json();
    const { category, ...postData } = data;

    // Validate category
    const validCategories = [
      'research', 
      'achievements', 
      'publications', 
      'events', 
      'patents',
      'case-studies',
      'blogs',
      'industry-collaborations'
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Get the authenticated user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isApproved) {
      return NextResponse.json({ error: 'User not approved to create posts' }, { status: 403 });
    }

    // Generate unique slug before creating the post
    const uniqueSlug = await generateUniqueSlug(postData.title);

    // Create the base blog post first
    const blogPost = new Blog({
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      author: user._id,
      category: category,
      tags: postData.tags || [],
      featuredImage: postData.featuredImage,
      imageAnalysis: postData.imageAnalysis || null, // Store AI analysis data
      slug: uniqueSlug, // Explicitly set the slug
      status: 'pending' // All posts start as pending review
    });

    await blogPost.save();

    let specializedPost = null;

    // Create specialized post based on category
    try {
      switch (category) {
        case 'research':
        case 'publications':
          if (postData.researchData) {
            specializedPost = new Research({
              basePost: blogPost._id,
              ...postData.researchData
            });
            await specializedPost.save();
            
            // Link the specialized post to the blog
            await Blog.findByIdAndUpdate(blogPost._id, {
              researchData: specializedPost._id
            });
            
            // Update user stats
            await User.findByIdAndUpdate(
              user._id, 
              { $inc: { 'profileStats.totalPublications': 1 } }
            );
          }
          break;

        case 'patents':
          if (postData.patentData) {
            specializedPost = new Patent({
              basePost: blogPost._id,
              ...postData.patentData
            });
            await specializedPost.save();
            
            // Link the specialized post to the blog
            await Blog.findByIdAndUpdate(blogPost._id, {
              patentData: specializedPost._id
            });
            
            // Update user stats
            await User.findByIdAndUpdate(
              user._id, 
              { $inc: { 'profileStats.totalPatents': 1 } }
            );
          }
          break;

        case 'achievements':
          if (postData.achievementData) {
            specializedPost = new Achievement({
              basePost: blogPost._id,
              ...postData.achievementData
            });
            await specializedPost.save();
            
            // Link the specialized post to the blog
            await Blog.findByIdAndUpdate(blogPost._id, {
              achievementData: specializedPost._id
            });
            
            // Update user stats
            await User.findByIdAndUpdate(
              user._id, 
              { $inc: { 'profileStats.totalAchievements': 1 } }
            );
          }
          break;

        case 'events':
          if (postData.eventData) {
            specializedPost = new Event({
              basePost: blogPost._id,
              ...postData.eventData
            });
            await specializedPost.save();
            
            // Link the specialized post to the blog
            await Blog.findByIdAndUpdate(blogPost._id, {
              eventData: specializedPost._id
            });
            
            // Update user stats
            await User.findByIdAndUpdate(
              user._id, 
              { $inc: { 'profileStats.totalEvents': 1 } }
            );
          }
          break;

        default:
          // For other categories (blogs, case-studies, industry-collaborations)
          // No specialized model needed, just the base blog post
          break;
      }

      // Update user's total posts count
      await User.findByIdAndUpdate(
        user._id, 
        { $inc: { 'profileStats.totalPosts': 1 } }
      );

      // Create notification for admins (you can implement this later)
      // await createNotificationForAdmins('new_post_submitted', blogPost._id, user._id);

      const response = {
        success: true,
        message: 'Post created successfully and submitted for review',
        data: {
          blogPost: {
            id: blogPost._id,
            title: blogPost.title,
            category: blogPost.category,
            status: blogPost.status,
            slug: blogPost.slug
          }
        }
      };

      if (specializedPost) {
        response.data.specializedPost = {
          id: specializedPost._id,
          type: category
        };
      }

      return NextResponse.json(response, { status: 201 });

    } catch (specializedError) {
      // If specialized post creation fails, delete the base blog post
      await Blog.findByIdAndDelete(blogPost._id);
      throw specializedError;
    }

  } catch (error) {
    console.error('Error creating post:', error);
    
    // Return specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// GET method to retrieve posts with filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const userId = searchParams.get('userId');
    const includeSpecialized = searchParams.get('includeSpecialized') === 'true';

    const query = { status };
    
    if (category) {
      query.category = category;
    }
    
    if (userId) {
      query.author = userId;
    }

    const skip = (page - 1) * limit;

    let posts = await Blog.find(query)
      .populate('author', 'name department academicInfo.designation profileImage')
      .populate('researchData')
      .populate('patentData')
      .populate('achievementData')
      .populate('eventData')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Specialized data is now automatically populated via references
    // No need for manual fetching

    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
