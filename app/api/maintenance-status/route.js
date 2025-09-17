import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

// PUBLIC endpoint to check maintenance status (no authentication required)
export async function GET() {
  try {
    await connectDB();
    
    // Import Settings dynamically to handle potential edge runtime issues
    const { default: Settings } = await import('@/models/Settings');
    
    if (!Settings) {
      // If Settings model couldn't be created, assume no maintenance
      return NextResponse.json({
        maintenanceMode: false,
        maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.'
      });
    }
    
    const settings = await Settings.getSettings();
    
    return NextResponse.json({
      maintenanceMode: settings.maintenanceMode || false,
      maintenanceMessage: settings.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'
    });
  } catch (error) {
    console.error('Maintenance status error:', error);
    
    // If there's an error, assume no maintenance mode
    return NextResponse.json({
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.'
    });
  }
}