import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterContentService from '@/lib/newsletter-content-service';

// GET - Preview newsletter HTML
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const newsletterId = url.searchParams.get('id');
    const weekOffset = parseInt(url.searchParams.get('weekOffset') || '0');

    let htmlContent = '';

    if (newsletterId) {
      // Preview existing newsletter
      const newsletter = await Newsletter.findById(newsletterId);
      if (!newsletter) {
        return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
      }
      htmlContent = newsletter.content;
    } else {
      // Preview weekly content
      const now = new Date();
      const offsetDays = weekOffset * 7;
      const currentDay = now.getDay();
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
      
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysSinceMonday - 7 - offsetDays);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get weekly content and generate HTML
      const weeklyContent = await NewsletterContentService.getWeeklyContent(weekStart, weekEnd);
      htmlContent = NewsletterContentService.generateNewsletterHTML(weeklyContent, { start: weekStart, end: weekEnd });
    }

    // Return HTML for direct browser rendering
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Newsletter preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
