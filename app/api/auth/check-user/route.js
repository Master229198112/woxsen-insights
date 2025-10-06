import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// This is a debug endpoint - should be disabled in production or protected by admin auth
export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('name email role department isApproved createdAt');
    
    if (!user) {
      return NextResponse.json({
        exists: false,
        message: `No account found with email: ${email}`,
        suggestion: 'Please check if the email is correct or register a new account.'
      });
    }

    // User exists, return status
    return NextResponse.json({
      exists: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      },
      message: user.isApproved 
        ? `Account found and approved for ${email}`
        : `Account found but pending approval for ${email}. Contact an administrator.`
    });

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
