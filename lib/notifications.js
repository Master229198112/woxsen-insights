import Notification from '@/models/Notification';
import Comment from '@/models/Comment';
import connectDB from './mongodb';

export class NotificationService {
  static async createNotification({
    recipient,
    sender = null,
    type,
    title,
    message,
    relatedBlog = null,
    relatedComment = null,
    data = {}
  }) {
    try {
      await connectDB();
      
      const notification = new Notification({
        recipient,
        sender,
        type,
        title,
        message,
        relatedBlog,
        relatedComment,
        data
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async notifyBlogStatusChange(blog, newStatus, changedBy, customMessage = null) {
    let title, message;
    
    switch (newStatus) {
      case 'approved':
        title = 'Blog Approved!';
        message = customMessage || `Your blog "${blog.title}" has been approved and is ready for publication.`;
        break;
      case 'rejected':
        title = 'Blog Rejected';
        message = customMessage || `Your blog "${blog.title}" was rejected. Please review the feedback and resubmit.`;
        break;
      case 'published':
        title = 'Blog Published!';
        message = customMessage || `Your blog "${blog.title}" is now live and visible to everyone.`;
        break;
      default:
        title = 'Blog Status Updated';
        message = customMessage || `Your blog "${blog.title}" status has been updated to ${newStatus}.`;
    }

    return await this.createNotification({
      recipient: blog.author,
      sender: changedBy,
      type: `blog_${newStatus}`,
      title,
      message,
      relatedBlog: blog._id,
      data: {
        blogTitle: blog.title,
        newStatus,
        rejectionReason: blog.rejectionReason
      }
    });
  }

  static async notifyBlogEdited(blog, editedBy, changes) {
    const isAuthorEdit = blog.author.toString() === editedBy.toString();
    
    if (!isAuthorEdit) {
      // Notify author that admin edited their blog
      return await this.createNotification({
        recipient: blog.author,
        sender: editedBy,
        type: 'blog_edited',
        title: 'Your Blog Was Edited',
        message: `An admin has made changes to your blog "${blog.title}". Changes: ${changes}`,
        relatedBlog: blog._id,
        data: {
          blogTitle: blog.title,
          changes,
          editedBy: editedBy.name
        }
      });
    }
  }

  static async notifyNewComment(comment, blog) {
    // Notify blog author about new comment
    if (comment.author.toString() !== blog.author.toString()) {
      await this.createNotification({
        recipient: blog.author,
        sender: comment.author,
        type: 'comment_added',
        title: 'New Comment on Your Blog',
        message: `Someone commented on your blog "${blog.title}": "${comment.content.substring(0, 100)}..."`,
        relatedBlog: blog._id,
        relatedComment: comment._id,
        data: {
          blogTitle: blog.title,
          commentPreview: comment.content.substring(0, 100)
        }
      });
    }

    // Notify other commenters (if it's a reply)
    if (comment.parentComment) {
      const parentComment = await Comment.findById(comment.parentComment).populate('author');
      if (parentComment && parentComment.author._id.toString() !== comment.author.toString()) {
        await this.createNotification({
          recipient: parentComment.author._id,
          sender: comment.author,
          type: 'comment_reply',
          title: 'Reply to Your Comment',
          message: `Someone replied to your comment on "${blog.title}": "${comment.content.substring(0, 100)}..."`,
          relatedBlog: blog._id,
          relatedComment: comment._id,
          data: {
            blogTitle: blog.title,
            parentCommentId: comment.parentComment,
            replyPreview: comment.content.substring(0, 100)
          }
        });
      }
    }
  }

  static async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      await connectDB();
      
      const filter = { recipient: userId };
      if (unreadOnly) {
        filter.isRead = false;
      }

      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find(filter)
        .populate('sender', 'name profileImage')
        .populate('relatedBlog', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(filter);
      const unreadCount = await Notification.countDocuments({ 
        recipient: userId, 
        isRead: false 
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationIds, userId) {
    try {
      await connectDB();
      
      await Notification.updateMany(
        { 
          _id: { $in: notificationIds }, 
          recipient: userId 
        },
        { isRead: true }
      );

      return true;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      await connectDB();
      
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}
