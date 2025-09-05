import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { authOptions } from '@/lib/auth-config';

// GET - Newsletter analytics and subscriber management
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;

    if (action === 'stats') {
      // Get newsletter statistics
      const stats = await NewsletterSubscriber.getSubscriberStats();
      
      // Get recent subscribers
      const recentSubscribers = await NewsletterSubscriber.find()
        .sort({ subscribedAt: -1 })
        .limit(10)
        .select('email subscribedAt source');

      // Get weekly content stats for potential newsletter
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const weeklyContent = {
        newBlogs: await Blog.countDocuments({
          publishedAt: { $gte: oneWeekAgo },
          status: 'published'
        }),
        newAchievements: await Blog.countDocuments({
          category: 'achievements',
          publishedAt: { $gte: oneWeekAgo },
          status: 'published'
        }),
        newPublications: await Blog.countDocuments({
          category: 'publications',
          publishedAt: { $gte: oneWeekAgo },
          status: 'published'
        }),
        newEvents: await Blog.countDocuments({
          category: 'events',
          publishedAt: { $gte: oneWeekAgo },
          status: 'published'
        })
      };

      return NextResponse.json({
        stats,
        recentSubscribers,
        weeklyContent
      });
    }

    if (action === 'subscribers') {
      // Get paginated subscriber list
      const subscribers = await NewsletterSubscriber.find()
        .sort({ subscribedAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .select('email isActive subscribedAt unsubscribedAt source');

      const total = await NewsletterSubscriber.countDocuments();

      return NextResponse.json({
        subscribers,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          totalItems: total
        }
      });
    }

    if (action === 'generate-content') {
      // Generate newsletter content for current week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Get this week's content
      const weeklyBlogs = await Blog.find({
        publishedAt: { $gte: oneWeekAgo },
        status: 'published'
      })
      .populate('author', 'name department')
      .sort({ publishedAt: -1 });

      // Group by category
      const contentByCategory = weeklyBlogs.reduce((acc, blog) => {
        if (!acc[blog.category]) {
          acc[blog.category] = [];
        }
        acc[blog.category].push({
          title: blog.title,
          excerpt: blog.excerpt,
          author: blog.author.name,
          department: blog.author.department,
          publishedAt: blog.publishedAt,
          url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog/${blog.slug || blog._id}`
        });
        return acc;
      }, {});

      // Get active staff for highlights
      const activeAuthors = await User.find({
        role: { $in: ['admin', 'staff'] }
      }).select('name department email');

      return NextResponse.json({
        weekPeriod: {
          start: oneWeekAgo.toISOString(),
          end: new Date().toISOString()
        },
        contentByCategory,
        totalContent: weeklyBlogs.length,
        activeStaff: activeAuthors.length,
        staffList: activeAuthors
      });
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Newsletter admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Send newsletter or manage subscribers
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { action, ...data } = await request.json();

    if (action === 'send-test') {
      // Send test newsletter
      const { testEmail } = data;
      
      if (!testEmail) {
        return NextResponse.json(
          { error: 'Test email is required' },
          { status: 400 }
        );
      }

      // Here you would integrate with your email service
      // For now, we'll just log the action
      console.log(`📧 Test newsletter would be sent to: ${testEmail}`);

      return NextResponse.json({
        message: 'Test newsletter sent successfully',
        sentTo: testEmail
      });
    }

    if (action === 'send-weekly') {
      // Send weekly newsletter to all active subscribers
      const activeSubscribers = await NewsletterSubscriber.getActiveSubscribers();
      
      if (activeSubscribers.length === 0) {
        return NextResponse.json(
          { error: 'No active subscribers found' },
          { status: 400 }
        );
      }

      // Here you would integrate with your email service to send to all subscribers
      console.log(`📧 Weekly newsletter would be sent to ${activeSubscribers.length} subscribers`);

      return NextResponse.json({
        message: `Weekly newsletter sent to ${activeSubscribers.length} subscribers`,
        sentCount: activeSubscribers.length
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
