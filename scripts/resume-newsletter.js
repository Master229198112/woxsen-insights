// Emergency Newsletter Resume Script
// Use this to resume sending your failed newsletter

import connectDB from '../lib/mongodb.js';
import Newsletter from '../models/Newsletter.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import EmailService from '../lib/email-service.js';

async function resumeFailedNewsletter() {
  try {
    await connectDB();
    
    // Find your failed newsletter (replace with actual ID if known)
    const newsletter = await Newsletter.findOne({ 
      status: { $in: ['sending', 'failed'] }
    }).sort({ createdAt: -1 });
    
    if (!newsletter) {
      console.log('No failed newsletter found');
      return;
    }
    
    console.log('Found newsletter:', {
      id: newsletter._id,
      title: newsletter.title,
      status: newsletter.status,
      sent: newsletter.successfulSends || 0,
      total: newsletter.recipientCount || 0
    });
    
    // Get all active subscribers
    let allSubscribers;
    if (newsletter.type === 'weekly-digest') {
      allSubscribers = await NewsletterSubscriber.find({
        isActive: true,
        'preferences.weeklyDigest': true
      }).select('email unsubscribeToken');
    } else {
      allSubscribers = await NewsletterSubscriber.getActiveSubscribers();
    }
    
    console.log(`Total active subscribers: ${allSubscribers.length}`);
    
    // For immediate fix: assume first N subscribers got it, rest didn't
    const sentCount = newsletter.successfulSends || 25; // Your reported 25 sent
    const remainingSubscribers = allSubscribers.slice(sentCount);
    
    console.log(`Assuming first ${sentCount} subscribers received it`);
    console.log(`Sending to remaining ${remainingSubscribers.length} subscribers`);
    
    if (remainingSubscribers.length === 0) {
      console.log('No remaining subscribers to send to');
      return;
    }
    
    // Ask for confirmation
    console.log('\\nAre you sure you want to proceed? This will send to:');
    remainingSubscribers.slice(0, 5).forEach(sub => console.log(`  - ${sub.email}`));
    if (remainingSubscribers.length > 5) {
      console.log(`  ... and ${remainingSubscribers.length - 5} more`);
    }
    
    // Uncomment the lines below after reviewing the subscriber list
    /*
    console.log('\\nStarting send...');
    newsletter.status = 'sending';
    await newsletter.save();
    
    const results = await EmailService.sendNewsletter({
      subscribers: remainingSubscribers,
      subject: newsletter.subject,
      content: newsletter.content,
      newsletterId: newsletter._id
    });
    
    // Update newsletter with final counts
    newsletter.successfulSends = sentCount + results.successful;
    newsletter.failedSends = (newsletter.failedSends || 0) + results.failed;
    newsletter.status = 'sent';
    newsletter.sentDate = new Date();
    newsletter.metadata.sendingCompleted = new Date();
    await newsletter.save();
    
    console.log('✅ Resume completed!', {
      previouslySent: sentCount,
      newlySent: results.successful,
      failed: results.failed,
      totalSent: newsletter.successfulSends,
      totalFailed: newsletter.failedSends
    });
    */
    
  } catch (error) {
    console.error('Error resuming newsletter:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
resumeFailedNewsletter();
