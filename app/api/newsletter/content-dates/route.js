import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Research from '@/models/Research';
import Achievement from '@/models/Achievement';
import Event from '@/models/Event';
import Patent from '@/models/Patent';

// GET - Get available content dates for newsletter generation
export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const months = parseInt(url.searchParams.get('months') || '6'); // Default to 6 months
    const includeEmpty = url.searchParams.get('includeEmpty') === 'true';

    // Calculate date range (looking back from now)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    console.log(`📅 Getting content dates from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get all content with dates in the range
    const [blogs, research, achievements, events, patents] = await Promise.all([
      Blog.aggregate([
        {
          $match: {
            status: 'published',
            publishedAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$publishedAt' },
              month: { $month: '$publishedAt' },
              week: { $week: '$publishedAt' }
            },
            count: { $sum: 1 },
            items: {
              $push: {
                id: '$_id',
                title: '$title',
                date: '$publishedAt',
                category: '$category'
              }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.week': -1 } }
      ]),

      Research.aggregate([
        {
          $lookup: {
            from: 'blogs',
            localField: 'basePost',
            foreignField: '_id',
            as: 'blog'
          }
        },
        {
          $match: {
            'blog.status': 'published',
            'blog.publishedAt': {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: { $arrayElemAt: ['$blog.publishedAt', 0] } },
              month: { $month: { $arrayElemAt: ['$blog.publishedAt', 0] } },
              week: { $week: { $arrayElemAt: ['$blog.publishedAt', 0] } }
            },
            count: { $sum: 1 },
            items: {
              $push: {
                id: '$_id',
                title: { $arrayElemAt: ['$blog.title', 0] },
                date: { $arrayElemAt: ['$blog.publishedAt', 0] },
                paperType: '$paperType'
              }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.week': -1 } }
      ]),

      Achievement.aggregate([
        {
          $match: {
            achievedDate: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$achievedDate' },
              month: { $month: '$achievedDate' },
              week: { $week: '$achievedDate' }
            },
            count: { $sum: 1 },
            items: {
              $push: {
                id: '$_id',
                title: '$title',
                date: '$achievedDate',
                level: '$level'
              }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.week': -1 } }
      ]),

      Event.aggregate([
        {
          $match: {
            eventDate: {
              $gte: startDate,
              $lte: endDate
            },
            status: 'published'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$eventDate' },
              month: { $month: '$eventDate' },
              week: { $week: '$eventDate' }
            },
            count: { $sum: 1 },
            items: {
              $push: {
                id: '$_id',
                title: '$title',
                date: '$eventDate',
                eventType: '$eventType'
              }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.week': -1 } }
      ]),

      Patent.aggregate([
        {
          $match: {
            filedDate: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$filedDate' },
              month: { $month: '$filedDate' },
              week: { $week: '$filedDate' }
            },
            count: { $sum: 1 },
            items: {
              $push: {
                id: '$_id',
                title: '$title',
                date: '$filedDate',
                status: '$status'
              }
            }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.week': -1 } }
      ])
    ]);

    // Combine and organize data by week
    const weeklyData = new Map();

    // Helper function to get Monday of the week
    const getMondayOfWeek = (date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    };

    // Helper function to get Sunday of the week
    const getSundayOfWeek = (monday) => {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return sunday;
    };

    // Process each content type
    const processContentType = (data, type) => {
      data.forEach(group => {
        // Create a representative date for this week
        const year = group._id.year;
        const week = group._id.week;
        
        // Approximate date from year and week
        const jan1 = new Date(year, 0, 1);
        const approximateDate = new Date(jan1.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
        const monday = getMondayOfWeek(approximateDate);
        const sunday = getSundayOfWeek(monday);
        
        const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
        
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, {
            weekStart: monday.toISOString(),
            weekEnd: sunday.toISOString(),
            weekLabel: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            totalItems: 0,
            contentTypes: {
              blogs: { count: 0, items: [] },
              research: { count: 0, items: [] },
              achievements: { count: 0, items: [] },
              events: { count: 0, items: [] },
              patents: { count: 0, items: [] }
            }
          });
        }
        
        const weekData = weeklyData.get(weekKey);
        weekData.contentTypes[type].count += group.count;
        weekData.contentTypes[type].items.push(...group.items);
        weekData.totalItems += group.count;
      });
    };

    // Process all content types
    processContentType(blogs, 'blogs');
    processContentType(research, 'research');
    processContentType(achievements, 'achievements');
    processContentType(events, 'events');
    processContentType(patents, 'patents');

    // Convert to array and sort by date (most recent first)
    let weeksArray = Array.from(weeklyData.entries()).map(([key, data]) => ({
      weekKey: key,
      ...data
    }));

    // Sort by week start date (descending - most recent first)
    weeksArray.sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));

    // Filter out empty weeks if requested
    if (!includeEmpty) {
      weeksArray = weeksArray.filter(week => week.totalItems > 0);
    }

    // Generate summary statistics
    const summary = {
      totalWeeks: weeksArray.length,
      weeksWithContent: weeksArray.filter(week => week.totalItems > 0).length,
      totalItems: weeksArray.reduce((sum, week) => sum + week.totalItems, 0),
      contentBreakdown: {
        blogs: weeksArray.reduce((sum, week) => sum + week.contentTypes.blogs.count, 0),
        research: weeksArray.reduce((sum, week) => sum + week.contentTypes.research.count, 0),
        achievements: weeksArray.reduce((sum, week) => sum + week.contentTypes.achievements.count, 0),
        events: weeksArray.reduce((sum, week) => sum + week.contentTypes.events.count, 0),
        patents: weeksArray.reduce((sum, week) => sum + week.contentTypes.patents.count, 0)
      },
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        months: months
      }
    };

    console.log(`📊 Found ${weeksArray.length} weeks with data, ${summary.weeksWithContent} have content`);

    return NextResponse.json({
      success: true,
      data: {
        weeks: weeksArray,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching content dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content dates' },
      { status: 500 }
    );
  }
}