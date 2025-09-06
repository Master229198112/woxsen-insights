import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET() {
  try {
    await connectDB();
    
    const blogs = await Blog.find({})
      .populate('author', 'name email')
      .limit(5)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: blogs.length,
      blogs: blogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        status: blog.status,
        author: blog.author,
        createdAt: blog.createdAt,
        hasEditHistory: blog.editHistory?.length > 0,
        editHistoryCount: blog.editHistory?.length || 0
      }))
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
