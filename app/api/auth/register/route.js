import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings'; // ADD THIS IMPORT

export async function POST(request) {
  try {
    await connectDB();

    // CHECK REGISTRATION SETTINGS - ADD THIS BLOCK
    const settings = await Settings.getSettings();
    
    if (!settings.allowRegistration) {
      return NextResponse.json(
        { error: 'User registration is currently disabled' },
        { status: 403 }
      );
    }
    
    const { name, email, password, department } = await request.json();

    // Validation
    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user - UPDATED THIS PART
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      department: department.trim(),
      isApproved: !settings.requireApproval, // Auto-approve if not required
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // UPDATED RESPONSE MESSAGE
    return NextResponse.json(
      {
        message: settings.requireApproval 
          ? 'Account created successfully. Please wait for admin approval.'
          : 'Account created successfully. You can now sign in.',
        requiresApproval: settings.requireApproval,
        user: userWithoutPassword
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
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
