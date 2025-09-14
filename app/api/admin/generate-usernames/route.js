import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Generate username from name
function generateUsernameFromName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .substring(0, 25);
}

// Check if username exists
async function isUsernameUnique(username, excludeId = null) {
  const query = { username };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await User.findOne(query);
  return !existing;
}

// Generate unique username
async function generateUniqueUsername(name, userId) {
  const baseUsername = generateUsernameFromName(name);
  let username = baseUsername;
  let counter = 1;
  
  while (!(await isUsernameUnique(username, userId))) {
    username = `${baseUsername}.${counter}`;
    counter++;
  }
  
  return username;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    const { userId } = body;
    
    if (userId) {
      // Generate username for specific user
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      if (user.username) {
        return NextResponse.json({
          message: 'User already has a username',
          username: user.username
        });
      }
      
      const username = await generateUniqueUsername(user.name, user._id);
      await User.findByIdAndUpdate(user._id, { username });
      
      return NextResponse.json({
        message: 'Username generated successfully',
        userId: user._id,
        username,
        userName: user.name
      });
      
    } else {
      // Generate usernames for all users without usernames
      const usersWithoutUsernames = await User.find({
        $or: [
          { username: { $exists: false } },
          { username: null },
          { username: '' }
        ]
      });
      
      let updated = 0;
      let skipped = 0;
      const results = [];
      
      for (const user of usersWithoutUsernames) {
        try {
          if (!user.name) {
            skipped++;
            continue;
          }
          
          const username = await generateUniqueUsername(user.name, user._id);
          await User.findByIdAndUpdate(user._id, { username });
          
          results.push({
            userId: user._id,
            userName: user.name,
            email: user.email,
            username
          });
          updated++;
          
        } catch (error) {
          console.error(`Error processing user ${user._id}:`, error);
          skipped++;
        }
      }
      
      return NextResponse.json({
        message: 'Usernames generated successfully',
        updated,
        skipped,
        results: results.slice(0, 10) // Return first 10 results
      });
    }
    
  } catch (error) {
    console.error('Generate usernames error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
