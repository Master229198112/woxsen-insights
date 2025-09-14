import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import NewsletterContentService from '@/lib/newsletter-content-service';
import EmailService from '@/lib/email-service';

// GET - List newsletters with filtering and pagination
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [newsletters, total] = await Promise.all([
      Newsletter.find(filter)
        .populate('metadata.createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Newsletter.countDocuments(filter)
    ]);

    const stats = await Newsletter.getNewsletterStats();

    return NextResponse.json({
      newsletters,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      stats
    });

  } catch (error) {
    console.error('Newsletter listing error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}

// POST - Create new newsletter
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { title, subject, content, type = 'manual', scheduledDate, generateWeeklyContent = false } = data;

    // Validation
    if (!title || !subject) {
      return NextResponse.json(
        { error: 'Title and subject are required' },
        { status: 400 }
      );
    }

    let newsletterContent = content;
    let contentSummary = {};

    // Generate weekly content if requested
    if (generateWeeklyContent || type === 'weekly-digest') {
      const weekRange = NewsletterContentService.getPreviousWeekRange();
      const weeklyContent = await NewsletterContentService.getWeeklyContent(weekRange.start, weekRange.end);
      
      newsletterContent = NewsletterContentService.generateNewsletterHTML(weeklyContent, weekRange);
      contentSummary = {
        blogs: weeklyContent.blogs,
        research: weeklyContent.research,
        achievements: weeklyContent.achievements,
        events: weeklyContent.events,
        patents: weeklyContent.patents
      };
    }

    // Create newsletter
    const newsletter = new Newsletter({
      title,
      subject,
      content: newsletterContent,
      type,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      contentSummary,
      metadata: {
        createdBy: session.user.id,
        ...(type === 'weekly-digest' && {
          weekRange: NewsletterContentService.getPreviousWeekRange()
        })
      }
    });

    await newsletter.save();
    await newsletter.populate('metadata.createdBy', 'name email');

    console.log(`📝 Newsletter created: "${title}" by ${session.user.name}`);

    return NextResponse.json({
      message: 'Newsletter created successfully',
      newsletter
    });

  } catch (error) {
    console.error('Newsletter creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter' },
      { status: 500 }
    );
  }
}

// PUT - Update newsletter
export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { id, title, subject, content, scheduledDate, status } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Check if newsletter can be edited
    if (newsletter.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot edit sent newsletters' },
        { status: 400 }
      );
    }

    // Update fields
    if (title) newsletter.title = title;
    if (subject) newsletter.subject = subject;
    if (content) newsletter.content = content;
    if (scheduledDate) newsletter.scheduledDate = new Date(scheduledDate);
    if (status && ['draft', 'scheduled'].includes(status)) newsletter.status = status;

    await newsletter.save();
    await newsletter.populate('metadata.createdBy', 'name email');

    console.log(`📝 Newsletter updated: "${newsletter.title}"`);

    return NextResponse.json({
      message: 'Newsletter updated successfully',
      newsletter
    });

  } catch (error) {
    console.error('Newsletter update error:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

// DELETE - Delete newsletter
export async function DELETE(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Check if newsletter can be deleted
    if (newsletter.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot delete sent newsletters' },
        { status: 400 }
      );
    }

    await Newsletter.findByIdAndDelete(id);

    console.log(`🗑️ Newsletter deleted: "${newsletter.title}"`);

    return NextResponse.json({
      message: 'Newsletter deleted successfully'
    });

  } catch (error) {
    console.error('Newsletter deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter' },
      { status: 500 }
    );
  }
}
