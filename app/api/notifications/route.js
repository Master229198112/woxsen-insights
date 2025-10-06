import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NotificationService } from '@/lib/notifications';

// Cache for 30 seconds to reduce polling load
export const revalidate = 30;

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const result = await NotificationService.getUserNotifications(
      session.user.id,
      { page, limit, unreadOnly }
    );

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60'
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notificationIds, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      await NotificationService.markAllAsRead(session.user.id);
    } else if (notificationIds && notificationIds.length > 0) {
      await NotificationService.markAsRead(notificationIds, session.user.id);
    } else {
      return NextResponse.json(
        { error: 'No notification IDs provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Notifications marked as read'
    });

  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
