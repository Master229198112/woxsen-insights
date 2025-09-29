import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Research from '@/models/Research';
import Achievement from '@/models/Achievement';
import Event from '@/models/Event';
import Patent from '@/models/Patent';

class NewsletterContentService {
  /**
   * Get content for weekly digest
   */
  async getWeeklyContent(startDate, endDate) {
    await connectDB();

    console.log(`📰 Compiling weekly content from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const [blogs, research, achievements, events, patents] = await Promise.all([
      this.getWeeklyBlogs(startDate, endDate),
      this.getWeeklyResearch(startDate, endDate),
      this.getWeeklyAchievements(startDate, endDate),
      this.getUpcomingEvents(endDate),
      this.getWeeklyPatents(startDate, endDate)
    ]);

    const totalContent = blogs.length + research.length + achievements.length + events.length + patents.length;

    // If no content found in the specified range, try to get recent content as fallback
    if (totalContent === 0) {
      console.log(`⚠️ No content found in specified date range. Trying recent content as fallback...`);
      
      const fallbackEndDate = new Date();
      const fallbackStartDate = new Date();
      fallbackStartDate.setDate(fallbackStartDate.getDate() - 30); // Last 30 days
      
      console.log(`🔄 Fallback: Looking for content from ${fallbackStartDate.toISOString()} to ${fallbackEndDate.toISOString()}`);
      
      const [fallbackBlogs, fallbackResearch, fallbackAchievements, fallbackEvents, fallbackPatents] = await Promise.all([
        this.getWeeklyBlogs(fallbackStartDate, fallbackEndDate),
        this.getWeeklyResearch(fallbackStartDate, fallbackEndDate),
        this.getWeeklyAchievements(fallbackStartDate, fallbackEndDate),
        this.getUpcomingEvents(fallbackEndDate),
        this.getWeeklyPatents(fallbackStartDate, fallbackEndDate)
      ]);
      
      const fallbackTotal = fallbackBlogs.length + fallbackResearch.length + fallbackAchievements.length + fallbackEvents.length + fallbackPatents.length;
      
      if (fallbackTotal > 0) {
        console.log(`✅ Found ${fallbackTotal} items in fallback period`);
        return {
          blogs: fallbackBlogs,
          research: fallbackResearch,
          achievements: fallbackAchievements,
          events: fallbackEvents,
          patents: fallbackPatents,
          summary: {
            totalItems: fallbackTotal,
            weekRange: { start: fallbackStartDate, end: fallbackEndDate },
            isFallback: true,
            originalRange: { start: startDate, end: endDate }
          }
        };
      }
    }

    return {
      blogs,
      research,
      achievements,
      events,
      patents,
      summary: {
        totalItems: totalContent,
        weekRange: { start: startDate, end: endDate }
      }
    };
  }

  /**
   * Get blog posts from the past week
   */
  async getWeeklyBlogs(startDate, endDate) {
    try {
      console.log(`📝 Searching for blogs between ${startDate.toISOString()} and ${endDate.toISOString()}`);
      
      const blogs = await Blog.find({
        status: 'published',
        publishedAt: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('author', 'name profileImage')
      .sort({ publishedAt: -1 })
      .limit(10)
      .select('title slug excerpt content author publishedAt featuredImage');

      console.log(`📝 Found ${blogs.length} published blogs in date range`);
      
      // Also check if there are any published blogs at all
      const totalPublishedBlogs = await Blog.countDocuments({ status: 'published' });
      console.log(`📝 Total published blogs in database: ${totalPublishedBlogs}`);
      
      if (totalPublishedBlogs > 0 && blogs.length === 0) {
        // Find the date range of existing published blogs
        const oldestBlog = await Blog.findOne({ status: 'published', publishedAt: { $exists: true } })
          .sort({ publishedAt: 1 })
          .select('publishedAt title');
        const newestBlog = await Blog.findOne({ status: 'published', publishedAt: { $exists: true } })
          .sort({ publishedAt: -1 })
          .select('publishedAt title');
        
        console.log(`📝 Blog date range: ${oldestBlog?.publishedAt?.toISOString()} to ${newestBlog?.publishedAt?.toISOString()}`);
        console.log(`📝 Oldest blog: "${oldestBlog?.title}"`);
        console.log(`📝 Newest blog: "${newestBlog?.title}"`);
      }

      return blogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || this.generateExcerpt(blog.content),
        author: blog.author?.name || 'Anonymous',
        authorImage: blog.author?.profileImage,
        publishedDate: blog.publishedAt,
        featuredImage: blog.featuredImage || '/images/default-blog.jpg',
        url: `${process.env.NEXTAUTH_URL}/blog/${blog.slug}`
      }));
    } catch (error) {
      console.error('Error fetching weekly blogs:', error);
      return [];
    }
  }

  /**
   * Get research papers from the past week
   */
  async getWeeklyResearch(startDate, endDate) {
    try {
      const research = await Research.find({
        status: 'published',
        publishedDate: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('author', 'name profileImage')
      .sort({ publishedDate: -1 })
      .limit(8)
      .select('title abstract author publishedDate journal researchArea doi');

      return research.map(paper => ({
        id: paper._id,
        title: paper.title,
        excerpt: paper.abstract ? paper.abstract.substring(0, 200) + '...' : '',
        author: paper.author?.name || 'Anonymous',
        authorImage: paper.author?.profileImage,
        publishedDate: paper.publishedDate,
        journal: paper.journal,
        researchArea: paper.researchArea,
        doi: paper.doi,
        url: paper.doi ? `https://doi.org/${paper.doi}` : '#'
      }));
    } catch (error) {
      console.error('Error fetching weekly research:', error);
      return [];
    }
  }

  /**
   * Get achievements from the past week
   */
  async getWeeklyAchievements(startDate, endDate) {
    try {
      const achievements = await Achievement.find({
        achievedDate: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .populate('achievedBy', 'name profileImage')
      .sort({ achievedDate: -1 })
      .limit(6)
      .select('title description achievedBy achievedDate category level');

      return achievements.map(achievement => ({
        id: achievement._id,
        title: achievement.title,
        description: achievement.description,
        achievedBy: achievement.achievedBy?.name || 'Unknown',
        achievedByImage: achievement.achievedBy?.profileImage,
        achievedDate: achievement.achievedDate,
        category: achievement.category,
        level: achievement.level
      }));
    } catch (error) {
      console.error('Error fetching weekly achievements:', error);
      return [];
    }
  }

  /**
   * Get upcoming events (next 2 weeks from end date)
   */
  async getUpcomingEvents(fromDate) {
    try {
      const twoWeeksLater = new Date(fromDate);
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

      const events = await Event.find({
        eventDate: {
          $gte: fromDate,
          $lte: twoWeeksLater
        },
        status: 'published'
      })
      .sort({ eventDate: 1 })
      .limit(5)
      .select('title description eventDate location organizer registrationUrl');

      return events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        location: event.location,
        organizer: event.organizer,
        registrationUrl: event.registrationUrl
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  /**
   * Get patents from the past week
   */
  async getWeeklyPatents(startDate, endDate) {
    try {
      const patents = await Patent.find({
        filedDate: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ filedDate: -1 })
      .limit(4)
      .select('title description inventors filedDate patentNumber status');

      return patents.map(patent => ({
        id: patent._id,
        title: patent.title,
        description: patent.description,
        inventors: patent.inventors,
        filedDate: patent.filedDate,
        patentNumber: patent.patentNumber,
        status: patent.status
      }));
    } catch (error) {
      console.error('Error fetching weekly patents:', error);
      return [];
    }
  }

  /**
   * Generate excerpt from content
   */
  generateExcerpt(content, maxLength = 150) {
    if (!content) return '';
    
    // Remove HTML tags and get plain text
    const plainText = content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (plainText.length <= maxLength) return plainText;
    
    // Find the last complete word within the limit
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  /**
   * Get previous week's date range (Monday to Sunday)
   */
  getPreviousWeekRange() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days since last Monday
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Last Monday
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysSinceMonday - 7);
    lastMonday.setHours(0, 0, 0, 0);
    
    // Last Sunday
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);
    
    return {
      start: lastMonday,
      end: lastSunday
    };
  }

  /**
   * Generate email-client compatible newsletter HTML content
   */
  generateNewsletterHTML(content, weekRange) {
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date));
    };

    const formatShortDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(date));
    };

    const weekStart = formatShortDate(weekRange.start);
    const weekEnd = formatShortDate(weekRange.end);
    
    // Check if this is fallback content
    const isFallback = content.summary?.isFallback;
    const headerText = isFallback 
      ? `Recent Highlights • ${weekStart} - ${weekEnd} (Fallback Content)`
      : `Weekly Digest • ${weekStart} - ${weekEnd}`;

    // Get featured content
    const featuredBlog = content.blogs[0];
    const secondaryBlogs = content.blogs.slice(1, 3); // 2nd and 3rd blogs for additional cards
    const otherBlogs = content.blogs.slice(3); // Remaining blogs after the first 3
    const moreStories = [
      ...otherBlogs,
      ...content.research.slice(0, 2),
      ...content.achievements.slice(0, 2)
    ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Woxsen School of Business Insights Weekly</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #1a1a1a; color: #ffffff;">
    
    <!-- Main Container Table -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #1a1a1a;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                
                <!-- Email Container -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #2d3748; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); padding: 30px 20px; text-align: center; color: #ffffff; border-radius: 8px 8px 0 0;">
                            <img src="${process.env.NEXTAUTH_URL}/Woxsen-University.jpg" alt="Woxsen University" style="width: 120px; height: auto; margin-bottom: 15px;" />
                            <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">SCHOOL OF BUSINESS INSIGHTS</h1>
                            <p style="margin: 8px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.9;">${headerText}</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px; background-color: #2d3748;">
                            
                            ${isFallback ? `
                            <!-- Fallback Notice -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px; background-color: #451a03; border: 2px solid #ea580c; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #fed7aa; font-weight: bold;">📅 Notice: Showing Recent Content</h3>
                                        <p style="margin: 0; font-size: 14px; color: #fbbf24; line-height: 1.4;">
                                            No content was found for the requested date range (${formatShortDate(content.summary.originalRange.start)} - ${formatShortDate(content.summary.originalRange.end)}).<br>
                                            Showing recent content from ${weekStart} - ${weekEnd} instead.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            
                            <!-- Featured Blog (Latest) -->
                            ${featuredBlog ? `
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px; background-color: #374151; border: 1px solid #4b5563; border-radius: 12px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 0;">
                                        <img src="${featuredBlog.featuredImage}" alt="${featuredBlog.title}" style="width: 100%; height: 250px; object-fit: cover; display: block;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 25px;">
                                        <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: bold; color: #ffffff; line-height: 1.3;">${featuredBlog.title}</h2>
                                        <p style="margin: 0 0 15px 0; font-size: 13px; color: #d1d5db; font-weight: 600;">
                                            By ${featuredBlog.author} • ${formatShortDate(featuredBlog.publishedDate)}
                                        </p>
                                        <p style="margin: 0 0 20px 0; font-size: 16px; color: #e5e7eb; line-height: 1.6;">${featuredBlog.excerpt}</p>
                                        <a href="${featuredBlog.url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">READ FULL ARTICLE</a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            
                            <!-- Secondary Blog Cards (2nd & 3rd Latest) -->
                            ${secondaryBlogs.length > 0 ? `
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px;">
                                <tr>
                                    <td>
                                        ${secondaryBlogs.map(blog => `
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px; background-color: #374151; border: 1px solid #4b5563; border-radius: 12px;">
                                            <tr>
                                                <td style="padding: 0; border-radius: 12px; overflow: hidden;">
                                                    <!-- Mobile-first layout with image on top -->
                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="padding: 0;">
                                                                <img src="${blog.featuredImage}" alt="${blog.title}" style="width: 100%; height: 180px; object-fit: cover; display: block;" />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 20px;">
                                                                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #ffffff; line-height: 1.3;">${blog.title}</h3>
                                                                <p style="margin: 0 0 12px 0; font-size: 12px; color: #d1d5db; font-weight: 600;">
                                                                    By ${blog.author} • ${formatShortDate(blog.publishedDate)}
                                                                </p>
                                                                <p style="margin: 0 0 15px 0; font-size: 14px; color: #e5e7eb; line-height: 1.5;">${blog.excerpt}</p>
                                                                <a href="${blog.url}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">READ MORE</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        `).join('')}
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            
                            <!-- More Top Stories -->
                            ${(otherBlogs.length > 0 || content.research.length > 0 || content.achievements.length > 0 || content.events.length > 0) ? `
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px; background-color: #374151; border: 1px solid #4b5563; border-radius: 12px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #ffffff;">More Top Stories</h2>
                                        
                                        ${otherBlogs.map(blog => `
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 15px; background-color: #1f2937; border-radius: 8px; border: 1px solid #374151;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <a href="${blog.url}" style="font-size: 16px; font-weight: 600; color: #60a5fa; text-decoration: none; line-height: 1.4; display: block; margin-bottom: 4px;">${blog.title}</a>
                                                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                                        By ${blog.author} • ${formatShortDate(blog.publishedDate)} • Article
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        `).join('')}
                                        
                                        ${content.research.map(paper => `
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 15px; background-color: #1f2937; border-radius: 8px; border: 1px solid #374151;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <a href="${paper.url}" style="font-size: 16px; font-weight: 600; color: #60a5fa; text-decoration: none; line-height: 1.4; display: block; margin-bottom: 4px;">${paper.title}</a>
                                                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                                        By ${paper.author} • ${formatShortDate(paper.publishedDate)} • Research
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        `).join('')}
                                        
                                        ${content.achievements.map(achievement => `
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 15px; background-color: #1f2937; border-radius: 8px; border: 1px solid #374151;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <span style="font-size: 16px; font-weight: 600; color: #fbbf24; line-height: 1.4; display: block; margin-bottom: 4px;">🏆 ${achievement.title}</span>
                                                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                                        ${achievement.achievedBy} • ${formatShortDate(achievement.achievedDate)} • Achievement
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        `).join('')}
                                        
                                        ${content.events.map(event => `
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 15px; background-color: #1f2937; border-radius: 8px; border: 1px solid #374151;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <span style="font-size: 16px; font-weight: 600; color: #34d399; line-height: 1.4; display: block; margin-bottom: 4px;">📅 ${event.title}</span>
                                                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                                                        ${formatShortDate(event.eventDate)} • ${event.location || 'Event'} • Upcoming Event
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        `).join('')}
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                            
                            <!-- Call to Action -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                                <tr>
                                    <td style="padding: 25px; text-align: center; color: #ffffff;">
                                        <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px;">Stay Connected with Woxsen Insights</h3>
                                        <p style="margin: 0 0 20px 0; color: #e0e7ff; font-size: 14px;">Join our community of researchers, academics, and innovators.</p>
                                        <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; padding: 12px 24px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Visit Our Platform</a>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #111827; padding: 30px 20px; text-align: center; color: #9ca3af; border-radius: 0 0 8px 8px;">
                            <img src="${process.env.NEXTAUTH_URL}/Woxsen-University.jpg" alt="Woxsen University" style="width: 100px; height: auto; margin-bottom: 15px;" />
                            <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px;">SCHOOL OF BUSINESS INSIGHTS</h3>
                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #d1d5db;">Driving Innovation Through Knowledge</p>
                            
                            <div style="font-size: 12px; color: #6b7280; margin-top: 20px; line-height: 1.5;">
                                <p style="margin: 0 0 10px 0;">
                                    <a href="${process.env.NEXTAUTH_URL}" style="color: #60a5fa; text-decoration: none;">Visit Website</a>
                                </p>
                                <p style="margin: 0 0 15px 0;">© ${new Date().getFullYear()} Woxsen University. All rights reserved.</p>
                                <p style="margin: 0; font-size: 11px; color: #4b5563;">
                                    Woxsen University, Kamkole, Sadasivpet, Sangareddy District, Hyderabad - 502345, Telangana, India
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`;
  }
}

export default new NewsletterContentService();
