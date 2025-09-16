import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/lib/auth-config';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return default settings (these would typically be stored in a database)
    const defaultSettings = {
      general: {
        fromName: 'Woxsen Insights',
        fromEmail: 'sob.insights@woxsen.edu.in',
        replyToEmail: 'sob.insights@woxsen.edu.in',
        organizationName: 'Woxsen University'
      },
      automation: {
        autoSendEnabled: false,
        sendDay: 'monday',
        sendTime: '09:00',
        minContentThreshold: 3,
        timeZone: 'Asia/Kolkata'
      },
      content: {
        includeResearch: true,
        includeAchievements: true,
        includeEvents: true,
        includePatents: true,
        includeBlogs: true,
        includeIndustryCollaborations: true,
        maxItemsPerSection: 5
      },
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        logoUrl: '',
        footerText: 'Driving Innovation Through Knowledge'
      }
    };

    return NextResponse.json({
      settings: defaultSettings
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const settings = await request.json();

    // Here you would save the settings to your database
    // For now, we'll just return success
    console.log('Newsletter settings updated:', settings);

    return NextResponse.json({
      message: 'Settings saved successfully',
      settings
    });

  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}