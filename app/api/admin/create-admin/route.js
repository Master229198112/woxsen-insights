import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Not allowed in production' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const adminData = {
      name: 'Vishal Kumar Sharma',
      email: 'vishal.sharma@woxsen.edu.in',
      password: 'admin123',
      department: 'AI Research Centre',
      role: 'admin',
      isApproved: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists', email: adminData.email },
        { status: 200 }
      );
    }

    // Create admin user
    await User.create(adminData);
    
    return NextResponse.json({
      message: 'Admin user created successfully!',
      email: adminData.email,
      password: adminData.password,
      warning: 'Please change the password after first login!'
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
