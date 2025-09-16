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

    if (!newsletterId || !subscriberId) {
      // Return 1x1 transparent pixel even if tracking fails
      return new NextResponse(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          status: 200,
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Check if this open was already tracked to avoid duplicates
    const existingOpen = await NewsletterTracking.findOne({
      newsletterId,
      subscriberId,
      eventType: 'open'
    });

    if (!existingOpen) {
      // Record the open event
      await NewsletterTracking.create({
        newsletterId,
        subscriberId,
        eventType: 'open',
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });

      // Update newsletter open rate
      await updateNewsletterOpenRate(newsletterId);
    }

    // Return 1x1 transparent tracking pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Open tracking error:', error);
    
    // Always return a tracking pixel even on error
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

async function updateNewsletterOpenRate(newsletterId) {
  try {
    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) return;

    const totalOpens = await NewsletterTracking.countDocuments({
      newsletterId,
      eventType: 'open'
    });

    const openRate = newsletter.recipientCount > 0 
      ? (totalOpens / newsletter.recipientCount) * 100 
      : 0;

    await Newsletter.findByIdAndUpdate(newsletterId, {
      openRate: Math.round(openRate * 100) / 100 // Round to 2 decimal places
    });

  } catch (error) {
    console.error('Failed to update open rate:', error);
  }
}