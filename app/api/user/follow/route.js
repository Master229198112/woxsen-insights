import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Follow from '@/models/Follow';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { authOptions } from '@/lib/auth-config';

// Follow a user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { userId, source = 'profile-page' } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if target user allows followers
    if (!targetUser.privacySettings?.isPublic) {
      return NextResponse.json({ error: 'User profile is private' }, { status: 403 });
    }
    
    try {
      const follow = await Follow.followUser(session.user.id, userId, source);
      
      // Create notification for the followed user (only if Notification model exists)
      try {
        await Notification.create({
          recipient: userId,
          sender: session.user.id,
          type: 'new_follower',
          message: 'started following you',
          relatedId: follow._id,
          relatedModel: 'Follow'
        });
      } catch (notificationError) {
        // Don't fail the follow operation if notification creation fails
        console.error('Error creating follow notification:', notificationError);
      }
      
      return NextResponse.json({
        message: 'Successfully followed user',
        follow: {
          id: follow._id,
          followedAt: follow.followedAt,
          source: follow.followSource
        }
      }, { status: 201 });
      
    } catch (error) {
      if (error.message.includes('Already following') || error.message.includes('cannot follow themselves')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const reason = searchParams.get('reason') || 'personal-preference';
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    try {
      await Follow.unfollowUser(session.user.id, userId, reason);
      
      return NextResponse.json({
        message: 'Successfully unfollowed user'
      });
      
    } catch (error) {
      if (error.message.includes('Not following')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get follow status and related information
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    await connectDB();

    switch (action) {
      case 'check-status':
        if (!session) {
          return NextResponse.json({ isFollowing: false });
        }
        
        const isFollowing = await Follow.isFollowing(session.user.id, userId);
        return NextResponse.json({ isFollowing });

      case 'followers':
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const followers = await Follow.find({
          following: userId,
          isActive: true
        })
        .populate('follower', 'name profileImage academicInfo.designation department')
        .sort({ followedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        const totalFollowers = await Follow.countDocuments({
          following: userId,
          isActive: true
        });

        return NextResponse.json({
          followers: followers.map(f => f.follower),
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalFollowers / limit),
            totalCount: totalFollowers,
            hasNext: page < Math.ceil(totalFollowers / limit),
            hasPrev: page > 1
          }
        });

      case 'following':
        const followingPage = parseInt(searchParams.get('page')) || 1;
        const followingLimit = parseInt(searchParams.get('limit')) || 20;
        const followingSkip = (followingPage - 1) * followingLimit;

        const following = await Follow.find({
          follower: userId,
          isActive: true
        })
        .populate('following', 'name profileImage academicInfo.designation department')
        .sort({ followedAt: -1 })
        .skip(followingSkip)
        .limit(followingLimit)
        .lean();

        const totalFollowing = await Follow.countDocuments({
          follower: userId,
          isActive: true
        });

        return NextResponse.json({
          following: following.map(f => f.following),
          pagination: {
            currentPage: followingPage,
            totalPages: Math.ceil(totalFollowing / followingLimit),
            totalCount: totalFollowing,
            hasNext: followingPage < Math.ceil(totalFollowing / followingLimit),
            hasPrev: followingPage > 1
          }
        });

      case 'mutual':
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const mutualFollowers = await Follow.getMutualFollowers(session.user.id, userId);
        const mutualUsers = await User.find({
          _id: { $in: mutualFollowers }
        }).select('name profileImage academicInfo.designation').limit(10);

        return NextResponse.json({
          mutualFollowers: mutualUsers,
          count: mutualFollowers.length
        });

      case 'suggestions':
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const suggestions = await Follow.getFollowSuggestions(session.user.id, 10);
        return NextResponse.json({ suggestions });

      case 'stats':
        const stats = await Follow.aggregate([
          {
            $match: {
              $or: [{ follower: userId }, { following: userId }],
              isActive: true
            }
          },
          {
            $group: {
              _id: null,
              totalFollowers: {
                $sum: { $cond: [{ $eq: ['$following', userId] }, 1, 0] }
              },
              totalFollowing: {
                $sum: { $cond: [{ $eq: ['$follower', userId] }, 1, 0] }
              },
              avgEngagement: { $avg: '$qualityMetrics.engagementScore' }
            }
          }
        ]);

        return NextResponse.json({
          stats: stats[0] || {
            totalFollowers: 0,
            totalFollowing: 0,
            avgEngagement: 0
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Follow GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update follow relationship settings
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { userId, notificationSettings, action } = await request.json();
    
    if (action === 'update-notifications') {
      const follow = await Follow.findOne({
        follower: session.user.id,
        following: userId,
        isActive: true
      });
      
      if (!follow) {
        return NextResponse.json({ error: 'Not following this user' }, { status: 400 });
      }
      
      follow.notificationSettings = {
        ...follow.notificationSettings,
        ...notificationSettings
      };
      
      await follow.save();
      
      return NextResponse.json({
        message: 'Notification settings updated',
        settings: follow.notificationSettings
      });
    }
    
    if (action === 'update-interaction') {
      const { interactionType } = await request.json();
      
      const follow = await Follow.findOne({
        follower: session.user.id,
        following: userId,
        isActive: true
      });
      
      if (follow) {
        switch (interactionType) {
          case 'like':
            follow.interactionHistory.totalLikes += 1;
            break;
          case 'comment':
            follow.interactionHistory.totalComments += 1;
            break;
          case 'share':
            follow.interactionHistory.totalShares += 1;
            break;
        }
        
        follow.interactionHistory.lastInteraction = new Date();
        follow.calculateEngagementScore();
        
        await follow.save();
      }
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Follow PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
