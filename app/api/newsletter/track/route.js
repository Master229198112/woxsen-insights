import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterTracking from '@/models/NewsletterTracking';

// GET - Track email opens (tracking pixel)
export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const newsletterId = url.searchParams.get('newsletter');
    const subscriberEmail = url.searchParams.get('email');
    const trackingId = url.searchParams.get('id');

    if (!newsletterId || !subscriberEmail) {
      // Return 1x1 transparent pixel even if tracking fails
      return new NextResponse(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Record the email open
    await recordEmailOpen(newsletterId, subscriberEmail, trackingId, request);

    // Return 1x1 transparent tracking pixel
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    console.error('Email tracking error:', error);
    
    // Always return tracking pixel even if error occurs
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}

async function recordEmailOpen(newsletterId, subscriberEmail, trackingId, request) {
  try {
    // Get user agent and IP for tracking (optional)
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Check if this open was already recorded (prevent duplicate tracking)
    const existingTracking = await NewsletterTracking.findOne({
      newsletterId,
      subscriberEmail,
      type: 'open',
      trackingId
    });

    if (existingTracking) {
      console.log('Email open already tracked:', { newsletterId, subscriberEmail });
      return;
    }

    // Record the email open
    await NewsletterTracking.create({
      newsletterId,
      subscriberEmail,
      type: 'open',
      trackingId,
      timestamp: new Date(),
      metadata: {
        userAgent,
        ipAddress,
        source: 'email-client'
      }
    });

    // Update newsletter open rate
    await updateNewsletterOpenRate(newsletterId);

    console.log('Email open tracked:', { newsletterId, subscriberEmail });

  } catch (error) {
    console.error('Error recording email open:', error);
  }
}

async function updateNewsletterOpenRate(newsletterId) {
  try {
    // Count unique opens for this newsletter
    const uniqueOpens = await NewsletterTracking.countDocuments({
      newsletterId,
      type: 'open'
    });

    // Get newsletter to find recipient count
    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter || newsletter.recipientCount === 0) {
      return;
    }

    // Calculate open rate percentage
    const openRate = (uniqueOpens / newsletter.recipientCount) * 100;

    // Update the newsletter
    await Newsletter.findByIdAndUpdate(newsletterId, {
      openRate: Math.round(openRate * 100) / 100 // Round to 2 decimal places
    });

    console.log(`Updated open rate for newsletter ${newsletterId}: ${openRate.toFixed(2)}%`);

  } catch (error) {
    console.error('Error updating newsletter open rate:', error);
  }
}