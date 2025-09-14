import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get request metadata for analytics
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');
    
    // Check if email already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = null;
        await existingSubscriber.save();
        
        return NextResponse.json({
          message: 'Successfully resubscribed! Welcome back.',
          subscriber: {
            email: existingSubscriber.email,
            subscribedAt: existingSubscriber.subscribedAt
          }
        });
      }
    }

    // Create new subscriber
    const newSubscriber = new NewsletterSubscriber({
      email: email.toLowerCase(),
      source: 'blog-sidebar',
      metadata: {
        ipAddress: forwardedFor?.split(',')[0] || 'unknown',
        userAgent: userAgent || 'unknown',
        referrer: referer || 'direct'
      }
    });

    await newSubscriber.save();
    
    console.log(`📧 New newsletter subscription: ${email}`);

    // Send welcome email
    try {
      const EmailService = (await import('@/lib/email-service')).default;
      await EmailService.sendWelcomeEmail(email);
      console.log(`✅ Welcome email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if welcome email fails
    }

    return NextResponse.json({
      message: 'Successfully subscribed! You\'ll receive weekly updates.',
      subscriber: {
        email: newSubscriber.email,
        subscribedAt: newSubscriber.subscribedAt
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: validationErrors.join('. ') },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status (optional)
export async function GET(request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const subscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase() 
    });

    return NextResponse.json({
      isSubscribed: subscriber ? subscriber.isActive : false,
      subscribedAt: subscriber?.subscribedAt || null
    });

  } catch (error) {
    console.error('Newsletter check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
