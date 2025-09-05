import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, token } = await request.json();
    
    // Validation
    if (!email && !token) {
      return NextResponse.json(
        { error: 'Email or unsubscribe token is required' },
        { status: 400 }
      );
    }

    let subscriber;
    
    if (token) {
      // Unsubscribe using token (from email link)
      subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });
    } else if (email) {
      // Unsubscribe using email
      subscriber = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    }
    
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: 'Already unsubscribed' },
        { status: 400 }
      );
    }

    // Unsubscribe
    await subscriber.unsubscribe();
    
    console.log(`📧 Newsletter unsubscribe: ${subscriber.email}`);

    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter',
      email: subscriber.email
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for unsubscribe page
export async function GET(request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json({
        message: 'Already unsubscribed',
        email: subscriber.email,
        status: 'already_unsubscribed'
      });
    }

    return NextResponse.json({
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt,
      status: 'active'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
