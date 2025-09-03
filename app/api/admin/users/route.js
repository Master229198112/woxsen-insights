import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth-config';

// GET /api/admin/users - Get all users (admin only)
export async function GET(request) {
  try {
    console.log('🔍 Admin users API called');
    
    // Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.email, 'Role:', session?.user?.role);
    
    if (!session || session.user.role !== 'admin') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('🗄️ Connecting to database...');
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // approved, pending, all
    console.log('📊 Filter status:', status);
    
    let filter = {};
    if (status === 'pending') {
      filter.isApproved = false;
    } else if (status === 'approved') {
      filter.isApproved = true;
    }

    console.log('🔍 Query filter:', filter);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    console.log('👥 Found users:', users.length);

    return NextResponse.json({ users });

  } catch (error) {
    console.error('❌ Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
