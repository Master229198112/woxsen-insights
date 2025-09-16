import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterTracking from '@/models/NewsletterTracking';

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const newsletterId = url.searchParams.get('n');
    const subscriberId = url.searchParams.get('s');
    const targetUrl = url.searchParams.get('url');

    if (!newsletterId || !subscriberId || !targetUrl) {
      return NextResponse.redirect(targetUrl || 'https://woxsen.edu.in');
    }

    // Record the click event
    await NewsletterTracking.create({
      newsletterId,
      subscriberId,
      eventType: 'click',
      targetUrl: decodeURIComponent(targetUrl),
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Update newsletter click rate
    await updateNewsletterClickRate(newsletterId);

    // Redirect to the original URL
    return NextResponse.redirect(decodeURIComponent(targetUrl));

  } catch (error) {
    console.error('Click tracking error:', error);
    
    // Still redirect to target URL even if tracking fails
    const targetUrl = new URL(request.url).searchParams.get('url');
    return NextResponse.redirect(targetUrl || 'https://woxsen.edu.in');
  }
}

async function updateNewsletterClickRate(newsletterId) {
  try {
    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) return;

    const totalClicks = await NewsletterTracking.countDocuments({
      newsletterId,
      eventType: 'click'
    });

    const clickRate = newsletter.recipientCount > 0 
      ? (totalClicks / newsletter.recipientCount) * 100 
      : 0;

    await Newsletter.findByIdAndUpdate(newsletterId, {
      clickRate: Math.round(clickRate * 100) / 100 // Round to 2 decimal places
    });

  } catch (error) {
    console.error('Failed to update click rate:', error);
  }
}