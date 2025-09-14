import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    await connectDB();
    console.log('Database connected successfully');
    
    // Test basic queries
    const blogCount = await Blog.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`Found ${blogCount} blogs and ${userCount} users`);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        blogCount,
        userCount,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
