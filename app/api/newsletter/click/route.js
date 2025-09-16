import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterTracking from '@/models/NewsletterTracking';
import { redirect } from 'next/navigation';

// GET - Track clicks and redirect to original URL
export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const newsletterId = url.searchParams.get('newsletter');
    const subscriberEmail = url.searchParams.get('email');
    const trackingId = url.searchParams.get('id');
    const originalUrl = url.searchParams.get('url');

    if (!newsletterId || !subscriberEmail || !originalUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Decode the original URL
    const decodedUrl = decodeURIComponent(originalUrl);

    // Record the click (async, don't wait for it)
    recordClick(newsletterId, subscriberEmail, trackingId, decodedUrl, request);

    // Redirect to the original URL
    return NextResponse.redirect(decodedUrl);

  } catch (error) {
    console.error('Click tracking error:', error);
    
    // Still redirect to original URL even if tracking fails
    const originalUrl = url.searchParams.get('url');
    if (originalUrl) {
      return NextResponse.redirect(decodeURIComponent(originalUrl));
    }
    
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

async function recordClick(newsletterId, subscriberEmail, trackingId, originalUrl, request) {
  try {
    // Get user agent and IP for tracking
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Record the click
    await NewsletterTracking.create({
      newsletterId,
      subscriberEmail,
      type: 'click',
      trackingId,
      url: originalUrl,
      timestamp: new Date(),
      metadata: {
        userAgent,
        ipAddress,
        source: 'email-link'
      }
    });

    // Update newsletter click rate
    await updateNewsletterClickRate(newsletterId);

    console.log('Click tracked:', { newsletterId, subscriberEmail, url: originalUrl });

  } catch (error) {
    console.error('Error recording click:', error);
  }
}

async function updateNewsletterClickRate(newsletterId) {
  try {
    // Count unique clicks for this newsletter
    const uniqueClicks = await NewsletterTracking.distinct('subscriberEmail', {
      newsletterId,
      type: 'click'
    }).then(emails => emails.length);

    // Get newsletter to find recipient count
    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter || newsletter.recipientCount === 0) {
      return;
    }

    // Calculate click rate percentage
    const clickRate = (uniqueClicks / newsletter.recipientCount) * 100;

    // Update the newsletter
    await Newsletter.findByIdAndUpdate(newsletterId, {
      clickRate: Math.round(clickRate * 100) / 100 // Round to 2 decimal places
    });

    console.log(`Updated click rate for newsletter ${newsletterId}: ${clickRate.toFixed(2)}%`);

  } catch (error) {
    console.error('Error updating newsletter click rate:', error);
  }
}