import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import NewsletterContentService from '@/lib/newsletter-content-service';

// POST - Generate weekly newsletter
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { weekOffset = 0, title, subject, customStartDate, customEndDate } = await request.json();

    console.log('📰 Generating newsletter content...');

    let weekStart, weekEnd;

    if (customStartDate && customEndDate) {
      // Use custom date range
      weekStart = new Date(customStartDate);
      weekStart.setHours(0, 0, 0, 0);
      
      weekEnd = new Date(customEndDate);
      weekEnd.setHours(23, 59, 59, 999);
      
      console.log(`📅 Using custom date range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
    } else {
      // Calculate week range (0 = last week, 1 = week before last, etc.)
      const now = new Date();
      const offsetDays = weekOffset * 7;
      const currentDay = now.getDay();
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
      
      weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysSinceMonday - 7 - offsetDays);
      weekStart.setHours(0, 0, 0, 0);
      
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      console.log(`📅 Using calculated week range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
    }

    // Get weekly content
    const weeklyContent = await NewsletterContentService.getWeeklyContent(weekStart, weekEnd);

    // Generate title and subject if not provided
    const formatWeekRange = (start, end) => {
      const options = { month: 'short', day: 'numeric' };
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    const defaultTitle = title || `Weekly Digest - ${formatWeekRange(weekStart, weekEnd)}`;
    const defaultSubject = subject || `🌟 Woxsen Insights Weekly - ${formatWeekRange(weekStart, weekEnd)}`;

    // Generate HTML content
    const htmlContent = NewsletterContentService.generateNewsletterHTML(weeklyContent, { start: weekStart, end: weekEnd });

    // Check if a newsletter for this week already exists
    const existingNewsletter = await Newsletter.findOne({
      type: 'weekly-digest',
      'metadata.weekRange.start': { $gte: weekStart, $lt: new Date(weekStart.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (existingNewsletter) {
      console.log('📰 Weekly newsletter already exists for this period');
      return NextResponse.json({
        message: 'Weekly newsletter already exists for this period',
        existing: true,
        newsletter: existingNewsletter,
        content: weeklyContent
      });
    }

    // Create new newsletter
    const newsletter = new Newsletter({
      title: defaultTitle,
      subject: defaultSubject,
      content: htmlContent,
      type: 'weekly-digest',
      status: 'draft',
      contentSummary: {
        blogs: weeklyContent.blogs,
        research: weeklyContent.research,
        achievements: weeklyContent.achievements,
        events: weeklyContent.events,
        patents: weeklyContent.patents
      },
      metadata: {
        createdBy: session.user.id,
        weekRange: {
          start: weekStart,
          end: weekEnd
        }
      }
    });

    await newsletter.save();
    await newsletter.populate('metadata.createdBy', 'name email');

    console.log(`📰 Weekly newsletter generated: "${defaultTitle}"`);
    console.log(`📊 Content summary:`, {
      blogs: weeklyContent.blogs.length,
      research: weeklyContent.research.length,
      achievements: weeklyContent.achievements.length,
      events: weeklyContent.events.length,
      patents: weeklyContent.patents.length,
      total: weeklyContent.summary.totalItems
    });

    return NextResponse.json({
      message: 'Weekly newsletter generated successfully',
      newsletter,
      content: weeklyContent,
      weekRange: {
        start: weekStart,
        end: weekEnd,
        formatted: formatWeekRange(weekStart, weekEnd)
      }
    });

  } catch (error) {
    console.error('Weekly newsletter generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly newsletter' },
      { status: 500 }
    );
  }
}

// GET - Preview weekly content without creating newsletter
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const weekOffset = parseInt(url.searchParams.get('weekOffset') || '0');

    // Calculate week range
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

    // Get weekly content
    const weeklyContent = await NewsletterContentService.getWeeklyContent(weekStart, weekEnd);

    // Format week range
    const formatWeekRange = (start, end) => {
      const options = { month: 'short', day: 'numeric' };
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    return NextResponse.json({
      content: weeklyContent,
      weekRange: {
        start: weekStart,
        end: weekEnd,
        formatted: formatWeekRange(weekStart, weekEnd)
      },
      preview: true
    });

  } catch (error) {
    console.error('Weekly content preview error:', error);
    return NextResponse.json(
      { error: 'Failed to preview weekly content' },
      { status: 500 }
    );
  }
}
