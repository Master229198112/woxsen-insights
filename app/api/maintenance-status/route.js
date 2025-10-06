import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

// Cache for 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    await connectDB();
    
    const { default: Settings } = await import('@/models/Settings');
    
    if (!Settings) {
      return NextResponse.json({
        maintenanceMode: false,
        maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.'
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      });
    }
    
    const settings = await Settings.getSettings();
    
    return NextResponse.json({
      maintenanceMode: settings.maintenanceMode || false,
      maintenanceMessage: settings.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Maintenance status error:', error);
    
    return NextResponse.json({
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  }
}
