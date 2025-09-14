import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import NewsletterContentService from '@/lib/newsletter-content-service';
import EmailService from '@/lib/email-service';

// POST - Generate and send weekly newsletter automatically
export async function POST(request) {
  try {
    // Check for authorization (you can add API key validation here)
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.NEWSLETTER_CRON_KEY || 'your-secure-cron-key';
    
    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      console.log('❌ Unauthorized newsletter cron attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    console.log('🔄 Starting automated weekly newsletter generation...');

    // Calculate previous week range
    const weekRange = NewsletterContentService.getPreviousWeekRange();
    
    // Check if newsletter already exists for this week
    const existingNewsletter = await Newsletter.findOne({
      type: 'weekly-digest',
      'metadata.weekRange.start': { 
        $gte: weekRange.start, 
        $lt: new Date(weekRange.start.getTime() + 24 * 60 * 60 * 1000) 
      }
    });

    if (existingNewsletter) {
      console.log(`📰 Newsletter already exists for week ${weekRange.start.toISOString()}`);
      
      // If it's in draft status, send it
      if (existingNewsletter.status === 'draft') {
        console.log('📧 Found draft newsletter, attempting to send...');
        return await sendNewsletter(existingNewsletter);
      }
      
      return NextResponse.json({
        message: 'Newsletter already exists for this week',
        newsletter: existingNewsletter,
        skipped: true
      });
    }

    // Generate weekly content
    const weeklyContent = await NewsletterContentService.getWeeklyContent(weekRange.start, weekRange.end);

    // Check if there's enough content to justify sending a newsletter
    const contentCount = weeklyContent.summary.totalItems;
    const minContentThreshold = parseInt(process.env.MIN_NEWSLETTER_CONTENT || '3');

    if (contentCount < minContentThreshold) {
      console.log(`📰 Insufficient content for newsletter: ${contentCount} items (minimum: ${minContentThreshold})`);
      
      // Create a draft newsletter for manual review
      const draftNewsletter = await createDraftNewsletter(weeklyContent, weekRange, contentCount);
      
      return NextResponse.json({
        message: `Insufficient content (${contentCount} items). Newsletter saved as draft for manual review.`,
        newsletter: draftNewsletter,
        contentCount,
        minThreshold: minContentThreshold,
        requiresManualReview: true
      });
    }

    // Generate newsletter content
    const formatWeekRange = (start, end) => {
      const options = { month: 'short', day: 'numeric' };
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    const title = `Weekly Digest - ${formatWeekRange(weekRange.start, weekRange.end)}`;
    const subject = `🌟 Woxsen Insights Weekly - ${formatWeekRange(weekRange.start, weekRange.end)}`;
    const htmlContent = NewsletterContentService.generateNewsletterHTML(weeklyContent, weekRange);

    // Create newsletter
    const newsletter = new Newsletter({
      title,
      subject,
      content: htmlContent,
      type: 'weekly-digest',
      status: 'draft',
      contentSummary: {
        blogs: weeklyContent.blogs,
        research: weeklyContent.research,
        achievements: weeklyContent.achievements,
        events: weeklyContent.events,
        patents: weeklyContent.patents
      },
      metadata: {
        createdBy: null, // Automated creation
        weekRange,
        automated: true,
        contentCount
      }
    });

    await newsletter.save();

    console.log(`📰 Weekly newsletter created: "${title}" with ${contentCount} items`);

    // Auto-send if enabled
    const autoSendEnabled = process.env.NEWSLETTER_AUTO_SEND === 'true';
    
    if (autoSendEnabled) {
      console.log('📧 Auto-send enabled, sending newsletter...');
      return await sendNewsletter(newsletter);
    } else {
      console.log('📧 Auto-send disabled, newsletter saved as draft');
      return NextResponse.json({
        message: 'Weekly newsletter generated successfully and saved as draft',
        newsletter,
        contentCount,
        autoSendDisabled: true
      });
    }

  } catch (error) {
    console.error('❌ Automated newsletter generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate automated newsletter', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to create draft newsletter with insufficient content
async function createDraftNewsletter(weeklyContent, weekRange, contentCount) {
  const formatWeekRange = (start, end) => {
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const title = `[DRAFT] Weekly Digest - ${formatWeekRange(weekRange.start, weekRange.end)}`;
  const subject = `🌟 Woxsen Insights Weekly - ${formatWeekRange(weekRange.start, weekRange.end)}`;
  const htmlContent = NewsletterContentService.generateNewsletterHTML(weeklyContent, weekRange);

  const newsletter = new Newsletter({
    title,
    subject,
    content: htmlContent,
    type: 'weekly-digest',
    status: 'draft',
    contentSummary: {
      blogs: weeklyContent.blogs,
      research: weeklyContent.research,
      achievements: weeklyContent.achievements,
      events: weeklyContent.events,
      patents: weeklyContent.patents
    },
    metadata: {
      createdBy: null,
      weekRange,
      automated: true,
      contentCount,
      insufficientContent: true,
      requiresManualReview: true
    }
  });

  await newsletter.save();
  return newsletter;
}

// Helper function to send newsletter
async function sendNewsletter(newsletter) {
  try {
    // Start sending process
    await newsletter.startSending();

    // Get active subscribers
    const subscribers = await NewsletterSubscriber.find({
      isActive: true,
      'preferences.weeklyDigest': true
    }).select('email unsubscribeToken');

    if (subscribers.length === 0) {
      await newsletter.markAsFailed('No active subscribers found');
      return NextResponse.json({
        message: 'No active subscribers found for newsletter',
        newsletter,
        error: 'No subscribers'
      });
    }

    console.log(`📧 Sending automated newsletter to ${subscribers.length} subscribers`);

    // Update recipient count
    newsletter.recipientCount = subscribers.length;
    await newsletter.save();

    // Send newsletter
    const results = await EmailService.sendNewsletter({
      subscribers,
      subject: newsletter.subject,
      content: newsletter.content,
      newsletterId: newsletter._id
    });

    // Mark as sent
    await newsletter.markAsSent(results.successful, results.failed);

    console.log(`✅ Automated newsletter sent successfully:`, {
      title: newsletter.title,
      successful: results.successful,
      failed: results.failed,
      total: subscribers.length
    });

    return NextResponse.json({
      message: 'Weekly newsletter generated and sent successfully',
      newsletter: {
        id: newsletter._id,
        title: newsletter.title,
        sentDate: newsletter.sentDate,
        status: newsletter.status
      },
      results: {
        total: subscribers.length,
        successful: results.successful,
        failed: results.failed
      },
      automated: true
    });

  } catch (error) {
    console.error('❌ Automated newsletter sending failed:', error);
    await newsletter.markAsFailed(error.message);
    
    return NextResponse.json({
      message: 'Newsletter generation succeeded but sending failed',
      newsletter,
      error: error.message,
      automated: true
    }, { status: 500 });
  }
}

// GET - Check status and trigger manual execution (for testing)
export async function GET(request) {
  try {
    // Simple auth check for GET requests
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const expectedKey = process.env.NEWSLETTER_CRON_KEY || 'your-secure-cron-key';
    
    if (key !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get last newsletter info
    const lastNewsletter = await Newsletter.findOne({ type: 'weekly-digest' })
      .sort({ createdAt: -1 });

    const weekRange = NewsletterContentService.getPreviousWeekRange();
    const subscriberCount = await NewsletterSubscriber.countDocuments({ 
      isActive: true, 
      'preferences.weeklyDigest': true 
    });

    return NextResponse.json({
      status: 'Scheduler is active',
      lastNewsletter: lastNewsletter ? {
        title: lastNewsletter.title,
        status: lastNewsletter.status,
        createdAt: lastNewsletter.createdAt,
        sentDate: lastNewsletter.sentDate,
        recipientCount: lastNewsletter.recipientCount
      } : null,
      nextWeekRange: {
        start: weekRange.start,
        end: weekRange.end
      },
      activeSubscribers: subscriberCount,
      autoSendEnabled: process.env.NEWSLETTER_AUTO_SEND === 'true',
      minContentThreshold: parseInt(process.env.MIN_NEWSLETTER_CONTENT || '3')
    });

  } catch (error) {
    console.error('Scheduler status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check scheduler status' },
      { status: 500 }
    );
  }
}
