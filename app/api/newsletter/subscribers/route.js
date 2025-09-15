import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

// GET - List subscribers with filtering, search, pagination, and export
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const source = url.searchParams.get('source');
    const search = url.searchParams.get('search');
    const exportData = url.searchParams.get('export') === 'true';

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }
    if (source && source !== 'all') {
      filter.source = source;
    }
    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }

    // Handle CSV export
    if (exportData) {
      const subscribers = await NewsletterSubscriber.find(filter)
        .sort({ subscribedAt: -1 })
        .select('email isActive subscribedAt unsubscribedAt source preferences metadata');

      // Generate CSV with updated category names
      const csvHeaders = [
        'Email',
        'Status', 
        'Source',
        'Subscribed Date',
        'Unsubscribed Date',
        'Weekly Digest',
        'Achievements',
        'Research & Publications', // Updated from separate Research/Publications
        'Events',
        'Blogs',
        'Patents',
        'Industry Collaborations',
        'IP Address',
        'User Agent',
        'Referrer'
      ];

      const csvRows = subscribers.map(subscriber => [
        subscriber.email,
        subscriber.isActive ? 'Active' : 'Inactive',
        subscriber.source || '',
        subscriber.subscribedAt ? subscriber.subscribedAt.toISOString() : '',
        subscriber.unsubscribedAt ? subscriber.unsubscribedAt.toISOString() : '',
        subscriber.preferences?.weeklyDigest ? 'Yes' : 'No',
        subscriber.preferences?.achievements ? 'Yes' : 'No',
        // Handle consolidated Research & Publications (check both research and publications)
        (subscriber.preferences?.research || subscriber.preferences?.publications) ? 'Yes' : 'No',
        subscriber.preferences?.events ? 'Yes' : 'No',
        subscriber.preferences?.blogs ? 'Yes' : 'No',
        subscriber.preferences?.patents ? 'Yes' : 'No',
        subscriber.preferences?.industryCollaborations ? 'Yes' : 'No',
        subscriber.metadata?.ipAddress || '',
        subscriber.metadata?.userAgent || '',
        subscriber.metadata?.referrer || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Regular listing
    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find(filter)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('email isActive subscribedAt unsubscribedAt source preferences metadata'),
      NewsletterSubscriber.countDocuments(filter)
    ]);

    const stats = await NewsletterSubscriber.getSubscriberStats();

    return NextResponse.json({
      subscribers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      stats
    });

  } catch (error) {
    console.error('Subscriber listing error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST - Add new subscriber (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { email, preferences = {} } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = null;
        existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
        await existingSubscriber.save();

        console.log(`📧 Subscriber reactivated by admin: ${email}`);

        return NextResponse.json({
          message: 'Subscriber reactivated successfully',
          subscriber: existingSubscriber
        });
      }
    }

    // Create new subscriber with updated preferences
    const newSubscriber = new NewsletterSubscriber({
      email: email.toLowerCase(),
      source: 'manual',
      preferences: {
        weeklyDigest: true,
        achievements: true,
        research: true, // Consolidated research & publications
        events: true,
        blogs: true,
        patents: true,
        industryCollaborations: true,
        ...preferences
      },
      metadata: {
        ipAddress: 'admin-added',
        userAgent: 'admin-interface',
        referrer: 'manual'
      }
    });

    await newSubscriber.save();

    console.log(`📧 New subscriber added by admin: ${email}`);

    return NextResponse.json({
      message: 'Subscriber added successfully',
      subscriber: newSubscriber
    });

  } catch (error) {
    console.error('Add subscriber error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add subscriber' },
      { status: 500 }
    );
  }
}

// PUT - Update subscriber preferences
export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { subscriberId, preferences, isActive } = await request.json();

    if (!subscriberId) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    const subscriber = await NewsletterSubscriber.findById(subscriberId);
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Update preferences
    if (preferences) {
      subscriber.preferences = { ...subscriber.preferences, ...preferences };
    }

    // Update active status
    if (typeof isActive === 'boolean') {
      subscriber.isActive = isActive;
      if (!isActive) {
        subscriber.unsubscribedAt = new Date();
      } else {
        subscriber.unsubscribedAt = null;
      }
    }

    await subscriber.save();

    console.log(`📧 Subscriber updated by admin: ${subscriber.email}`);

    return NextResponse.json({
      message: 'Subscriber updated successfully',
      subscriber
    });

  } catch (error) {
    console.error('Update subscriber error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

// DELETE - Remove subscriber
export async function DELETE(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const subscriberId = url.searchParams.get('id');

    if (!subscriberId) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    const subscriber = await NewsletterSubscriber.findByIdAndDelete(subscriberId);
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Subscriber deleted by admin: ${subscriber.email}`);

    return NextResponse.json({
      message: 'Subscriber deleted successfully'
    });

  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
