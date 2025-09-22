import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import Newsletter from '@/models/Newsletter';
import NewsletterDelivery from '@/models/NewsletterDelivery';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const newsletterId = url.searchParams.get('newsletterId');

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

    // Get delivery records for this newsletter
    const deliveryRecords = await NewsletterDelivery.find({ newsletterId })
      .sort({ sentAt: -1 });

    // Aggregate delivery status
    const statusSummary = await NewsletterDelivery.aggregate([
      { $match: { newsletterId: new mongoose.Types.ObjectId(newsletterId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          emails: { $push: '$email' }
        }
      }
    ]);

    // Get list of subscribers who haven't been attempted yet
    const attemptedEmails = deliveryRecords.map(record => record.email);
    
    // Get all active subscribers to find who hasn't been attempted
    const NewsletterSubscriber = (await import('@/models/NewsletterSubscriber')).default;
    let allSubscribers;
    
    if (newsletter.type === 'weekly-digest') {
      allSubscribers = await NewsletterSubscriber.find({
        isActive: true,
        'preferences.weeklyDigest': true
      }).select('email');
    } else {
      allSubscribers = await NewsletterSubscriber.find({
        isActive: true
      }).select('email');
    }

    const allEmails = allSubscribers.map(sub => sub.email);
    const notAttempted = allEmails.filter(email => !attemptedEmails.includes(email));

    const summary = {
      total: allEmails.length,
      sent: statusSummary.find(s => s._id === 'sent')?.count || 0,
      failed: statusSummary.find(s => s._id === 'failed')?.count || 0,
      pending: statusSummary.find(s => s._id === 'pending')?.count || 0,
      notAttempted: notAttempted.length
    };

    return NextResponse.json({
      newsletter: {
        id: newsletter._id,
        title: newsletter.title,
        status: newsletter.status,
        recipientCount: newsletter.recipientCount,
        successfulSends: newsletter.successfulSends,
        failedSends: newsletter.failedSends
      },
      deliverySummary: summary,
      deliveryRecords: deliveryRecords.slice(0, 50), // Latest 50 records
      failedEmails: statusSummary.find(s => s._id === 'failed')?.emails || [],
      notAttemptedEmails: notAttempted
    });

  } catch (error) {
    console.error('Delivery status error:', error);
    return NextResponse.json(
      { error: 'Failed to get delivery status' },
      { status: 500 }
    );
  }
}
