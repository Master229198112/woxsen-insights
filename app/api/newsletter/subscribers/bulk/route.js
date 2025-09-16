import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

// PUT - Bulk operations on subscribers
export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { subscriberIds, action, preferences } = await request.json();

    if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber IDs array is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let updateData = {};
    let logMessage = '';

    switch (action) {
      case 'unsubscribe':
        updateData = {
          isActive: false,
          unsubscribedAt: new Date()
        };
        logMessage = 'unsubscribed';
        break;
        
      case 'resubscribe':
        updateData = {
          isActive: true,
          unsubscribedAt: null,
          subscribedAt: new Date()
        };
        logMessage = 'resubscribed';
        break;
        
      case 'update-preferences':
        if (!preferences) {
          return NextResponse.json(
            { error: 'Preferences object is required for update-preferences action' },
            { status: 400 }
          );
        }
        updateData = { preferences };
        logMessage = 'preferences updated';
        break;
        
      case 'delete':
        // Handle deletion separately
        const deleteResult = await NewsletterSubscriber.deleteMany({
          _id: { $in: subscriberIds }
        });
        
        console.log(`🗑️ Bulk delete by admin: ${deleteResult.deletedCount} subscribers deleted`);
        
        return NextResponse.json({
          message: `Successfully deleted ${deleteResult.deletedCount} subscribers`,
          deleted: deleteResult.deletedCount
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: unsubscribe, resubscribe, update-preferences, delete' },
          { status: 400 }
        );
    }

    // Perform bulk update
    const result = await NewsletterSubscriber.updateMany(
      { _id: { $in: subscriberIds } },
      { $set: updateData }
    );

    console.log(`📧 Bulk ${logMessage} by admin: ${result.modifiedCount} subscribers affected`);

    return NextResponse.json({
      message: `Successfully ${logMessage} ${result.modifiedCount} subscribers`,
      updated: result.modifiedCount,
      matched: result.matchedCount
    });

  } catch (error) {
    console.error('Bulk subscriber operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

// POST - Import subscribers from CSV
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { subscribers } = await request.json();

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'Subscribers array is required' },
        { status: 400 }
      );
    }

    const results = {
      total: subscribers.length,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    for (const subscriberData of subscribers) {
      try {
        const { email, preferences = {}, source = 'csv-import' } = subscriberData;

        // Validate email
        if (!email || !emailRegex.test(email)) {
          results.errors.push(`Invalid email: ${email}`);
          results.skipped++;
          continue;
        }

        const normalizedEmail = email.toLowerCase();

        // Check if subscriber exists
        const existingSubscriber = await NewsletterSubscriber.findOne({ 
          email: normalizedEmail 
        });

        if (existingSubscriber) {
          if (existingSubscriber.isActive) {
            results.skipped++;
            continue;
          } else {
            // Reactivate existing subscriber
            existingSubscriber.isActive = true;
            existingSubscriber.subscribedAt = new Date();
            existingSubscriber.unsubscribedAt = null;
            existingSubscriber.preferences = { 
              ...existingSubscriber.preferences, 
              ...preferences 
            };
            await existingSubscriber.save();
            results.updated++;
          }
        } else {
          // Create new subscriber with updated category structure
          const newSubscriber = new NewsletterSubscriber({
            email: normalizedEmail,
            source,
            preferences: {
              weeklyDigest: true,
              achievements: true,
              research: true, // Consolidated Research & Publications
              events: true,
              blogs: true,
              patents: true,
              industryCollaborations: true,
              ...preferences
            },
            metadata: {
              ipAddress: 'bulk-import',
              userAgent: 'admin-interface',
              referrer: 'csv-import'
            }
          });

          await newSubscriber.save();
          results.added++;
        }

      } catch (error) {
        results.errors.push(`Error processing ${subscriberData.email}: ${error.message}`);
        results.skipped++;
      }
    }

    console.log(`📧 Bulk import completed:`, results);

    return NextResponse.json({
      message: `Import completed: ${results.added} added, ${results.updated} updated, ${results.skipped} skipped`,
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Failed to import subscribers' },
      { status: 500 }
    );
  }
}
