import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth-config';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    await connectDB();
    
    if (userId) {
      // Public profile view
      const user = await User.findById(userId)
        .select('-password -resetPasswordToken -resetPasswordExpiry')
        .populate('profileStats')
        .lean();
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Check privacy settings
      if (!user.privacySettings?.isPublic) {
        const session = await getServerSession(authOptions);
        if (!session || session.user.id !== userId) {
          return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
        }
      }
      
      // Filter data based on privacy settings
      const publicProfile = {
        ...user,
        email: user.privacySettings?.showEmail ? user.email : null,
        socialProfiles: user.privacySettings?.showSocialProfiles ? user.socialProfiles : {},
        profileStats: user.privacySettings?.showStats ? user.profileStats : null,
      };
      
      return NextResponse.json({ user: publicProfile });
    } else {
      // Own profile view - requires authentication
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const user = await User.findById(session.user.id)
        .select('-password -resetPasswordToken -resetPasswordExpiry')
        .lean();
      
      return NextResponse.json({ user });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const updateData = await request.json();
    const { updateType, ...data } = updateData;
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updateFields = {};

    switch (updateType) {
      case 'basic':
        updateFields = {
          name: data.name?.trim(),
          department: data.department?.trim(),
          bio: data.bio?.trim() || '',
        };
        break;
        
      case 'academic':
        updateFields = {
          'academicInfo.designation': data.designation?.trim(),
          'academicInfo.qualifications': data.qualifications || [],
          'academicInfo.researchInterests': data.researchInterests || [],
          'academicInfo.expertise': data.expertise || [],
          'academicInfo.teachingAreas': data.teachingAreas || [],
        };
        break;
        
      case 'social':
        updateFields = {
          socialProfiles: {
            linkedin: data.linkedin?.trim() || '',
            orcid: data.orcid?.trim() || '',
            googleScholar: data.googleScholar?.trim() || '',
            researchGate: data.researchGate?.trim() || '',
            website: data.website?.trim() || '',
            twitter: data.twitter?.trim() || '',
          }
        };
        break;
        
      case 'privacy':
        updateFields = {
          privacySettings: {
            isPublic: data.isPublic ?? true,
            showEmail: data.showEmail ?? false,
            showSocialProfiles: data.showSocialProfiles ?? true,
            showStats: data.showStats ?? true,
            showFollowers: data.showFollowers ?? true,
            allowDirectMessages: data.allowDirectMessages ?? true,
            showOnlineStatus: data.showOnlineStatus ?? false,
          }
        };
        break;
        
      case 'affiliations':
        // Clean affiliations data - remove temporary IDs that aren't valid ObjectIds
        const cleanedAffiliations = (data.affiliations || []).map(affiliation => {
          const cleaned = { ...affiliation };
          
          // Remove temporary _id if it's not a valid MongoDB ObjectId (24 char hex string)
          if (cleaned._id && (typeof cleaned._id === 'string' && !cleaned._id.match(/^[0-9a-fA-F]{24}$/))) {
            delete cleaned._id;
          }
          
          return cleaned;
        });
        
        updateFields = {
          affiliations: cleanedAffiliations
        };
        break;
        
      case 'profile-image':
        updateFields = {
          profileImage: data.profileImage
        };
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
    }

    // Add timestamp for profile update
    updateFields['activityLog.lastProfileUpdate'] = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -resetPasswordToken -resetPasswordExpiry');

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get profile statistics
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const { action, userId } = await request.json();
    
    if (action === 'increment-view') {
      // Increment profile view count
      if (userId && (!session || session.user.id !== userId)) {
        await User.findByIdAndUpdate(
          userId,
          { $inc: { 'profileStats.profileViews': 1 } }
        );
      }
      
      return NextResponse.json({ success: true });
    }
    
    if (action === 'get-suggestions') {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      await connectDB();
      const suggestions = await User.getUserSuggestions(session.user.id, 10);
      
      return NextResponse.json({ suggestions });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Profile action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
