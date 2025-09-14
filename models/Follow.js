import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  follower: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  following: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  followedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Follow relationship metadata
  followSource: {
    type: String,
    enum: ['profile-page', 'post-interaction', 'suggestion', 'search', 'mutual-connections'],
    default: 'profile-page'
  },
  
  // Notification settings for this follow relationship
  notificationSettings: {
    newPosts: {
      type: Boolean,
      default: true
    },
    achievements: {
      type: Boolean,
      default: true
    },
    publications: {
      type: Boolean,
      default: true
    },
    patents: {
      type: Boolean,
      default: false
    },
    events: {
      type: Boolean,
      default: false
    }
  },
  
  // Interaction history
  interactionHistory: {
    lastInteraction: {
      type: Date,
      default: Date.now
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    }
  },
  
  // Mutual connection information
  mutualConnections: {
    count: {
      type: Number,
      default: 0
    },
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Unfollowing history (for analytics)
  unfollowHistory: [{
    unfollowedAt: {
      type: Date,
      required: true
    },
    refollowedAt: {
      type: Date
    },
    reason: {
      type: String,
      enum: ['spam', 'irrelevant-content', 'too-frequent', 'personal-preference', 'inactive', 'other']
    },
    isRefollowed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Follow quality metrics
  qualityMetrics: {
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
followSchema.index({ follower: 1, following: 1 }, { unique: true }); // Prevent duplicate follows
followSchema.index({ follower: 1, isActive: 1, followedAt: -1 });
followSchema.index({ following: 1, isActive: 1, followedAt: -1 });
followSchema.index({ followedAt: -1 });
followSchema.index({ 'qualityMetrics.engagementScore': -1 });

// Static methods for follow operations
followSchema.statics.followUser = async function(followerId, followingId, source = 'profile-page') {
  // Prevent self-following
  if (followerId.toString() === followingId.toString()) {
    throw new Error('Users cannot follow themselves');
  }
  
  try {
    // Check if already following
    const existingFollow = await this.findOne({
      follower: followerId,
      following: followingId
    });
    
    if (existingFollow) {
      if (existingFollow.isActive) {
        throw new Error('Already following this user');
      } else {
        // Reactivate follow
        existingFollow.isActive = true;
        existingFollow.followedAt = new Date();
        existingFollow.followSource = source;
        existingFollow.unfollowHistory[existingFollow.unfollowHistory.length - 1].refollowedAt = new Date();
        existingFollow.unfollowHistory[existingFollow.unfollowHistory.length - 1].isRefollowed = true;
        await existingFollow.save();
        return existingFollow;
      }
    }
    
    // Create new follow
    const newFollow = new this({
      follower: followerId,
      following: followingId,
      followSource: source
    });
    
    await newFollow.save();
    
    // Update user stats
    const User = mongoose.models.User;
    await Promise.all([
      User.findByIdAndUpdate(followerId, { $inc: { 'profileStats.followingCount': 1 } }),
      User.findByIdAndUpdate(followingId, { $inc: { 'profileStats.followersCount': 1 } })
    ]);
    
    return newFollow;
  } catch (error) {
    throw error;
  }
};

followSchema.statics.unfollowUser = async function(followerId, followingId, reason = 'personal-preference') {
  try {
    const follow = await this.findOne({
      follower: followerId,
      following: followingId,
      isActive: true
    });
    
    if (!follow) {
      throw new Error('Not following this user');
    }
    
    // Deactivate follow and log unfollow
    follow.isActive = false;
    follow.unfollowHistory.push({
      unfollowedAt: new Date(),
      reason: reason
    });
    
    await follow.save();
    
    // Update user stats
    const User = mongoose.models.User;
    await Promise.all([
      User.findByIdAndUpdate(followerId, { $inc: { 'profileStats.followingCount': -1 } }),
      User.findByIdAndUpdate(followingId, { $inc: { 'profileStats.followersCount': -1 } })
    ]);
    
    return follow;
  } catch (error) {
    throw error;
  }
};

// Static method to check if user A follows user B
followSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId,
    isActive: true
  });
  return !!follow;
};

// Static method to get mutual followers
followSchema.statics.getMutualFollowers = async function(userId1, userId2) {
  const user1Followers = await this.find({
    following: userId1,
    isActive: true
  }).distinct('follower');
  
  const user2Followers = await this.find({
    following: userId2,
    isActive: true
  }).distinct('follower');
  
  const mutualFollowers = user1Followers.filter(id => 
    user2Followers.some(id2 => id.toString() === id2.toString())
  );
  
  return mutualFollowers;
};

// Static method to get follow suggestions
followSchema.statics.getFollowSuggestions = async function(userId, limit = 10) {
  try {
    // Get users that current user's followers also follow
    const userFollowingIds = await this.find({
      follower: userId,
      isActive: true
    }).distinct('following');
    
    // Find users followed by people I follow, but not by me
    const suggestions = await this.aggregate([
      {
        $match: {
          follower: { $in: userFollowingIds },
          following: { $nin: [...userFollowingIds, userId] },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$following',
          mutualCount: { $sum: 1 },
          lastFollowed: { $max: '$followedAt' }
        }
      },
      {
        $sort: { mutualCount: -1, lastFollowed: -1 }
      },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          mutualCount: 1,
          name: '$userInfo.name',
          department: '$userInfo.department',
          profileImage: '$userInfo.profileImage'
        }
      }
    ]);
    
    return suggestions;
  } catch (error) {
    throw error;
  }
};

// Instance method to calculate engagement score
followSchema.methods.calculateEngagementScore = function() {
  const totalInteractions = this.interactionHistory.totalLikes + 
                           this.interactionHistory.totalComments + 
                           this.interactionHistory.totalShares;
  
  const daysSinceFollow = Math.max(1, Math.floor((Date.now() - this.followedAt) / (1000 * 60 * 60 * 24)));
  const engagementRate = totalInteractions / daysSinceFollow;
  
  // Normalize to 0-100 scale (adjust multiplier based on typical engagement)
  const score = Math.min(100, Math.floor(engagementRate * 10));
  
  this.qualityMetrics.engagementScore = score;
  this.qualityMetrics.lastUpdated = new Date();
  
  return score;
};

// Pre-save middleware
followSchema.pre('save', function(next) {
  // Update interaction timestamp on any interaction change
  if (this.isModified('interactionHistory')) {
    this.interactionHistory.lastInteraction = new Date();
  }
  
  next();
});

// Post-save middleware for notifications
followSchema.post('save', async function(doc) {
  // Only create notification for new follows
  if (doc.isActive && doc.isNew) {
    try {
      const Notification = mongoose.models.Notification;
      if (Notification) {
        await Notification.create({
          recipient: doc.following,
          sender: doc.follower,
          type: 'new_follower',
          message: 'started following you',
          relatedId: doc._id,
          relatedModel: 'Follow'
        });
      }
    } catch (error) {
      console.error('Error creating follow notification:', error);
    }
  }
});

// Virtual for follow duration
followSchema.virtual('followDuration').get(function() {
  if (!this.isActive) return 0;
  return Math.floor((Date.now() - this.followedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for unfollow/refollow count
followSchema.virtual('unfollowCount').get(function() {
  return this.unfollowHistory ? this.unfollowHistory.length : 0;
});

export default mongoose.models.Follow || mongoose.model('Follow', followSchema);
