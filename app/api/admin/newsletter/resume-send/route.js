import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterDelivery from '@/models/NewsletterDelivery';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import EmailService from '@/lib/email-service';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { newsletterId, resumeType = 'failed' } = await request.json();

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

    // Get recipients to retry based on resumeType
    let emailsToSend = [];
    
    if (resumeType === 'failed') {
      // Only failed deliveries
      const failedRecords = await NewsletterDelivery.find({
        newsletterId,
        status: { $in: ['failed', 'pending'] }
      }).select('email');
      emailsToSend = failedRecords.map(record => record.email);
    } else if (resumeType === 'unsent') {
      // All subscribers who haven't been attempted yet
      const attemptedEmails = await NewsletterDelivery.distinct('email', { newsletterId });
      
      let allSubscribers;
      if (newsletter.type === 'weekly-digest') {
        allSubscribers = await NewsletterSubscriber.find({
          isActive: true,
          'preferences.weeklyDigest': true
        }).select('email unsubscribeToken');
      } else {
        allSubscribers = await NewsletterSubscriber.getActiveSubscribers();
      }
      
      const allEmails = allSubscribers.map(sub => sub.email);
      emailsToSend = allEmails.filter(email => !attemptedEmails.includes(email));
    } else if (resumeType === 'all') {
      // All failed + unsent
      const attemptedSuccessfully = await NewsletterDelivery.distinct('email', { 
        newsletterId, 
        status: 'sent' 
      });
      
      let allSubscribers;
      if (newsletter.type === 'weekly-digest') {
        allSubscribers = await NewsletterSubscriber.find({
          isActive: true,
          'preferences.weeklyDigest': true
        }).select('email unsubscribeToken');
      } else {
        allSubscribers = await NewsletterSubscriber.getActiveSubscribers();
      }
      
      const allEmails = allSubscribers.map(sub => sub.email);
      emailsToSend = allEmails.filter(email => !attemptedSuccessfully.includes(email));
    }

    if (emailsToSend.length === 0) {
      return NextResponse.json({
        message: 'No emails to send',
        emailsToSend: 0
      });
    }

    console.log(`📧 Resuming newsletter send to ${emailsToSend.length} recipients`);

    // Get full subscriber records for the emails to send
    const subscribersToSend = await NewsletterSubscriber.find({
      email: { $in: emailsToSend },
      isActive: true
    }).select('email unsubscribeToken');

    // Update newsletter status to sending
    newsletter.status = 'sending';
    await newsletter.save();

    // Send newsletter using the email service
    try {
      const results = await EmailService.sendNewsletterResume({
        subscribers: subscribersToSend,
        subject: newsletter.subject,
        content: newsletter.content,
        newsletterId: newsletter._id
      });

      // Update newsletter stats
      newsletter.successfulSends = (newsletter.successfulSends || 0) + results.successful;
      newsletter.failedSends = (newsletter.failedSends || 0) + results.failed;
      
      // Check if all delivery attempts are complete
      const totalAttempted = await NewsletterDelivery.countDocuments({ newsletterId });
      const totalSubscribers = newsletter.recipientCount || 0;
      
      if (totalAttempted >= totalSubscribers || results.failed === 0) {
        newsletter.status = 'sent';
        newsletter.sentDate = new Date();
        newsletter.metadata.sendingCompleted = new Date();
      }
      
      await newsletter.save();

      console.log(`✅ Newsletter resume completed:`, {
        attempted: emailsToSend.length,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors?.length || 0
      });

      return NextResponse.json({
        message: 'Newsletter resume completed',
        results: {
          attempted: emailsToSend.length,
          successful: results.successful,
          failed: results.failed,
          errors: results.errors
        },
        newsletter: {
          id: newsletter._id,
          status: newsletter.status,
          totalSuccessful: newsletter.successfulSends,
          totalFailed: newsletter.failedSends
        }
      });

    } catch (error) {
      console.error('Newsletter resume failed:', error);
      newsletter.status = 'failed';
      newsletter.metadata.errors.push(`Resume failed: ${error.message}`);
      await newsletter.save();
      
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
