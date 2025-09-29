import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import NewsletterDelivery from '@/models/NewsletterDelivery';
import EmailService from '@/lib/email-service';

// POST - Resume sending newsletter to unsent/failed recipients
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { newsletterId } = await request.json();

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

    console.log(`🔄 Resuming newsletter: ${newsletter.title}`);

    // Get unsent/failed emails
    const unsentEmails = await NewsletterDelivery.getUnsentEmails(newsletterId);

    if (unsentEmails.length === 0) {
      return NextResponse.json({
        message: 'No unsent or failed deliveries found',
        alreadyComplete: true
      });
    }

    console.log(`📧 Found ${unsentEmails.length} unsent/failed recipients`);

    // Get subscriber details for these emails
    const subscribers = await NewsletterSubscriber.find({
      email: { $in: unsentEmails },
      isActive: true
    }).select('email unsubscribeToken');

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found for unsent emails' },
        { status: 400 }
      );
    }

    console.log(`📧 Resuming send to ${subscribers.length} subscribers`);

    // Resume sending
    try {
      const results = await EmailService.sendNewsletterResume({
        subscribers,
        subject: newsletter.subject,
        content: newsletter.content,
        newsletterId: newsletter._id
      });

      // Update newsletter stats
      const deliveryStats = await NewsletterDelivery.getDeliveryStats(newsletterId);
      
      newsletter.successfulSends = deliveryStats.sent;
      newsletter.failedSends = deliveryStats.failed;
      
      // Mark as sent if all deliveries are complete
      if (deliveryStats.pending === 0 && deliveryStats.failed === 0) {
        newsletter.status = 'sent';
        newsletter.sentDate = new Date();
        newsletter.metadata.sendingCompleted = new Date();
      }
      
      await newsletter.save();

      console.log(`✅ Newsletter resume complete:`, {
        successful: results.successful,
        failed: results.failed,
        total: subscribers.length
      });

      return NextResponse.json({
        message: 'Newsletter sending resumed successfully',
        results: {
          attempted: subscribers.length,
          successful: results.successful,
          failed: results.failed,
          errors: results.errors
        },
        deliveryStats,
        newsletter: {
          id: newsletter._id,
          title: newsletter.title,
          status: newsletter.status,
          successfulSends: newsletter.successfulSends,
          failedSends: newsletter.failedSends
        }
      });

    } catch (error) {
      console.error('Newsletter resume failed:', error);
      return NextResponse.json(
        { error: `Failed to resume newsletter: ${error.message}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Newsletter resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get resume status and unsent count
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
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

    // Get delivery stats
    const deliveryStats = await NewsletterDelivery.getDeliveryStats(newsletterId);
    const unsentEmails = await NewsletterDelivery.getUnsentEmails(newsletterId);

    return NextResponse.json({
      deliveryStats,
      unsentCount: unsentEmails.length,
      canResume: unsentEmails.length > 0,
      completionPercentage: deliveryStats.total > 0 
        ? Math.round((deliveryStats.sent / deliveryStats.total) * 100)
        : 0
    });

  } catch (error) {
    console.error('Resume status error:', error);
    return NextResponse.json(
      { error: 'Failed to get resume status' },
      { status: 500 }
    );
  }
}
