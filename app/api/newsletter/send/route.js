import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import EmailService from '@/lib/email-service';

// POST - Send newsletter
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { newsletterId, testEmail } = await request.json();

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Check if newsletter can be sent
    if (newsletter.status === 'sent') {
      return NextResponse.json(
        { error: 'Newsletter has already been sent' },
        { status: 400 }
      );
    }

    if (!newsletter.content) {
      return NextResponse.json(
        { error: 'Newsletter content is required' },
        { status: 400 }
      );
    }

    // Handle test email
    if (testEmail) {
      try {
        await EmailService.sendEmail({
          to: testEmail,
          subject: `[TEST] ${newsletter.subject}`,
          html: newsletter.content
        });

        console.log(`📧 Test newsletter sent to: ${testEmail}`);

        return NextResponse.json({
          message: `Test newsletter sent to ${testEmail}`,
          testSent: true
        });
      } catch (error) {
        console.error('Test email failed:', error);
        return NextResponse.json(
          { error: `Failed to send test email: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Start sending process
    await newsletter.startSending();

    // Get active subscribers based on preferences
    let subscribers;
    if (newsletter.type === 'weekly-digest') {
      subscribers = await NewsletterSubscriber.find({
        isActive: true,
        'preferences.weeklyDigest': true
      }).select('email unsubscribeToken');
    } else {
      subscribers = await NewsletterSubscriber.getActiveSubscribers();
    }

    if (subscribers.length === 0) {
      await newsletter.markAsFailed('No active subscribers found');
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 400 }
      );
    }

    console.log(`📧 Starting newsletter send to ${subscribers.length} subscribers`);

    // Update recipient count
    newsletter.recipientCount = subscribers.length;
    await newsletter.save();

    // Send newsletter using the email service
    try {
      const results = await EmailService.sendNewsletter({
        subscribers,
        subject: newsletter.subject,
        content: newsletter.content,
        newsletterId: newsletter._id
      });

      // Mark newsletter as sent with results
      await newsletter.markAsSent(results.successful, results.failed);

      console.log(`✅ Newsletter "${newsletter.title}" sent successfully:`, {
        successful: results.successful,
        failed: results.failed,
        total: subscribers.length
      });

      return NextResponse.json({
        message: 'Newsletter sent successfully',
        results: {
          total: subscribers.length,
          successful: results.successful,
          failed: results.failed,
          errors: results.errors
        },
        newsletter: {
          id: newsletter._id,
          title: newsletter.title,
          sentDate: newsletter.sentDate,
          status: newsletter.status
        }
      });

    } catch (error) {
      console.error('Newsletter sending failed:', error);
      await newsletter.markAsFailed(error.message);
      
      return NextResponse.json(
        { error: `Failed to send newsletter: ${error.message}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get newsletter sending status
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const newsletterId = url.searchParams.get('id');

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    const newsletter = await Newsletter.findById(newsletterId)
      .populate('metadata.createdBy', 'name email');

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      newsletter: {
        id: newsletter._id,
        title: newsletter.title,
        status: newsletter.status,
        recipientCount: newsletter.recipientCount,
        successfulSends: newsletter.successfulSends,
        failedSends: newsletter.failedSends,
        sentDate: newsletter.sentDate,
        scheduledDate: newsletter.scheduledDate,
        openRate: newsletter.openRate,
        clickRate: newsletter.clickRate,
        createdBy: newsletter.metadata.createdBy,
        sendingStarted: newsletter.metadata.sendingStarted,
        sendingCompleted: newsletter.metadata.sendingCompleted,
        errors: newsletter.metadata.errors
      }
    });

  } catch (error) {
    console.error('Newsletter status error:', error);
    return NextResponse.json(
      { error: 'Failed to get newsletter status' },
      { status: 500 }
    );
  }
}
