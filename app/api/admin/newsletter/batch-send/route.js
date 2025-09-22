// api/admin/newsletter/batch-send/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import NewsletterDelivery from '@/models/NewsletterDelivery';
import Office365EmailService from '@/lib/office365-email-service';
import { getActiveConfig } from '@/lib/email-batch-config';

// Get Office365 optimized configuration
const config = getActiveConfig();
const BATCH_SIZE = config.BATCH_SIZE || 25; // Office365 optimized batch size
const BATCH_DELAY = config.BATCH_DELAY || 3000; // 3 seconds between batches
const RETRY_ATTEMPTS = config.RETRY_ATTEMPTS || 3;

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Process a single batch of emails using the existing Office365 service
async function processBatch(batch, newsletter, batchNumber, totalBatches) {
  console.log(`Processing batch ${batchNumber}/${totalBatches} with ${batch.length} emails via Office365`);
  
  const results = {
    successful: [],
    failed: [],
    batchNumber,
    totalInBatch: batch.length
  };

  // Use existing Office365 service but send emails individually with better control
  for (const subscriber of batch) {
    try {
      // Add personalized unsubscribe link
      const personalizedContent = Office365EmailService.addUnsubscribeLink(
        newsletter.content, 
        subscriber.unsubscribeToken, 
        newsletter._id
      );
      
      // Send individual email using Office365 service
      const emailResult = await Office365EmailService.sendEmail({
        to: subscriber.email,
        subject: newsletter.subject,
        html: personalizedContent,
        text: Office365EmailService.stripHtml(personalizedContent)
      });

      if (emailResult.success) {
        results.successful.push(subscriber.email);
        
        // Record successful delivery
        await NewsletterDelivery.findOneAndUpdate(
          { newsletterId: newsletter._id, email: subscriber.email },
          {
            newsletterId: newsletter._id,
            email: subscriber.email,
            status: 'sent',
            sentAt: new Date(),
            messageId: emailResult.messageId,
            attempts: 1,
            lastAttemptAt: new Date()
          },
          { upsert: true, new: true }
        );
      } else {
        throw new Error(emailResult.error || 'Unknown email sending error');
      }

      // Small delay between individual emails in batch (helps with Office365 rate limiting)
      if (subscriber !== batch[batch.length - 1]) {
        await delay(200); // 200ms between individual emails
      }

    } catch (error) {
      console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
      
      results.failed.push({
        email: subscriber.email,
        error: error.message,
        subscriberId: subscriber._id
      });
      
      // Record failed delivery
      await NewsletterDelivery.findOneAndUpdate(
        { newsletterId: newsletter._id, email: subscriber.email },
        {
          newsletterId: newsletter._id,
          email: subscriber.email,
          status: 'failed',
          failureReason: error.message,
          error: error.message,
          attempts: 1,
          lastAttemptAt: new Date()
        },
        { upsert: true, new: true }
      );
    }
  }

  return results;
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { newsletterId, resumeType = 'all' } = await request.json();

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID is required' }, { status: 400 });
    }

    // Find the newsletter
    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    // Get recipients based on resume type
    let recipientsToSend = [];
    
    if (resumeType === 'failed') {
      // Only get subscribers who had failed deliveries for this newsletter
      const failedRecords = await NewsletterDelivery.find({
        newsletterId: newsletter._id,
        status: { $in: ['failed', 'pending'] }
      }).select('email');
      
      const failedEmails = failedRecords.map(record => record.email);
      recipientsToSend = await NewsletterSubscriber.find({
        email: { $in: failedEmails },
        isActive: true
      }).select('email unsubscribeToken _id');
      
    } else if (resumeType === 'unsent') {
      // Get subscribers who haven't been sent this newsletter at all
      const attemptedEmails = await NewsletterDelivery.distinct('email', { newsletterId: newsletter._id });
      
      let allSubscribers;
      if (newsletter.type === 'weekly-digest') {
        allSubscribers = await NewsletterSubscriber.find({
          isActive: true,
          'preferences.weeklyDigest': true
        }).select('email unsubscribeToken _id');
      } else {
        allSubscribers = await NewsletterSubscriber.find({
          isActive: true
        }).select('email unsubscribeToken _id');
      }
      
      recipientsToSend = allSubscribers.filter(subscriber => 
        !attemptedEmails.includes(subscriber.email)
      );
      
    } else if (resumeType === 'all') {
      // Get both failed and unsent
      const successfulEmails = await NewsletterDelivery.distinct('email', { 
        newsletterId: newsletter._id, 
        status: 'sent' 
      });
      
      let allSubscribers;
      if (newsletter.type === 'weekly-digest') {
        allSubscribers = await NewsletterSubscriber.find({
          isActive: true,
          'preferences.weeklyDigest': true
        }).select('email unsubscribeToken _id');
      } else {
        allSubscribers = await NewsletterSubscriber.find({
          isActive: true
        }).select('email unsubscribeToken _id');
      }
      
      recipientsToSend = allSubscribers.filter(subscriber => 
        !successfulEmails.includes(subscriber.email)
      );
    }

    if (recipientsToSend.length === 0) {
      return NextResponse.json({ 
        message: 'No recipients found for the specified criteria',
        results: { successful: 0, failed: 0, total: 0, batches: 0 }
      });
    }

    // Update newsletter status
    await Newsletter.findByIdAndUpdate(newsletterId, { 
      status: 'sending',
      'metadata.sendingStarted': new Date()
    });

    console.log(`Starting batch sending to ${recipientsToSend.length} recipients`);
    
    // Split recipients into batches
    const batches = [];
    for (let i = 0; i < recipientsToSend.length; i += BATCH_SIZE) {
      batches.push(recipientsToSend.slice(i, i + BATCH_SIZE));
    }

    const totalBatches = batches.length;
    const overallResults = {
      successful: [],
      failed: [],
      total: recipientsToSend.length,
      batchResults: []
    };

    // Process each batch with delay
    for (let i = 0; i < batches.length; i++) {
      const batchResults = await processBatch(
        batches[i], 
        newsletter, 
        i + 1, 
        totalBatches
      );
      
      overallResults.successful.push(...batchResults.successful);
      overallResults.failed.push(...batchResults.failed);
      overallResults.batchResults.push(batchResults);
      
      // Update newsletter progress
      await Newsletter.findByIdAndUpdate(newsletterId, {
        successfulSends: overallResults.successful.length,
        failedSends: overallResults.failed.length
      });
      
      // Add delay between batches (except for the last batch)
      if (i < batches.length - 1) {
        console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
        await delay(BATCH_DELAY);
      }
    }

    // Update newsletter with final results
    const finalStatus = overallResults.failed.length === 0 ? 'sent' : 
                       overallResults.successful.length === 0 ? 'failed' : 'partially_sent';
    
    await Newsletter.findByIdAndUpdate(newsletterId, {
      status: finalStatus,
      successfulSends: overallResults.successful.length,
      failedSends: overallResults.failed.length,
      sentDate: finalStatus === 'sent' ? new Date() : newsletter.sentDate,
      'metadata.sendingCompleted': new Date(),
      batchInfo: {
        totalBatches,
        batchSize: BATCH_SIZE,
        completedAt: new Date()
      }
    });

    console.log(`Batch sending completed: ${overallResults.successful.length} successful, ${overallResults.failed.length} failed`);

    return NextResponse.json({
      message: 'Batch sending completed',
      results: {
        successful: overallResults.successful.length,
        failed: overallResults.failed.length,
        total: overallResults.total,
        batches: totalBatches,
        details: overallResults
      }
    });

  } catch (error) {
    console.error('Batch send error:', error);
    
    // Update newsletter status to failed if we have the newsletterId
    try {
      const { newsletterId } = await request.json();
      if (newsletterId) {
        await Newsletter.findByIdAndUpdate(newsletterId, { 
          status: 'failed',
          'metadata.errors': { $push: error.message }
        });
      }
    } catch (updateError) {
      console.error('Failed to update newsletter status:', updateError);
    }

    return NextResponse.json(
      { error: 'Failed to send newsletter', details: error.message }, 
      { status: 500 }
    );
  }
}

// GET endpoint for real-time progress (optional)
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const newsletterId = searchParams.get('newsletterId');
    
    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID required' }, { status: 400 });
    }

    await connectDB();
    const newsletter = await Newsletter.findById(newsletterId);
    
    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: newsletter.status,
      successfulSends: newsletter.successfulSends || 0,
      failedSends: newsletter.failedSends || 0,
      recipientCount: newsletter.recipientCount || 0,
      batchInfo: newsletter.batchInfo || null,
      lastSentAt: newsletter.sentDate,
      lastError: newsletter.metadata?.errors?.[newsletter.metadata.errors.length - 1] || null
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' }, 
      { status: 500 }
    );
  }
}