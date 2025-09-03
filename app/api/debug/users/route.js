import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
    }

    await connectDB();
    
    const allUsers = await User.find({}).select('-password');
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ isApproved: false });
    const approvedUsers = await User.countDocuments({ isApproved: true });
    
    console.log('🔍 Debug - Total users:', totalUsers);
    console.log('📋 All users:', allUsers.map(u => ({ 
      email: u.email, 
      name: u.name, 
      role: u.role, 
      approved: u.isApproved 
    })));
    
    return NextResponse.json({
      message: 'Database debug successful',
      totalUsers,
      pendingUsers,
      approvedUsers,
      users: allUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        department: user.department,
        createdAt: user.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
