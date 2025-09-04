import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import User from '@/models/User';
import { authOptions } from '@/lib/auth-config';

// GET - Fetch current settings
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const settings = await Settings.getSettings();
    
    // Don't send sensitive data to frontend
    const safeSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      adminEmail: settings.adminEmail,
      allowRegistration: settings.allowRegistration,
      requireApproval: settings.requireApproval,
      autoPublish: settings.autoPublish,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      emailEnabled: settings.emailEnabled,
      maxFileSize: settings.maxFileSize,
      allowedFileTypes: settings.allowedFileTypes,
      lastUpdated: settings.lastUpdated,
      // Don't send SMTP credentials for security
      smtpConfigured: !!(settings.smtpHost && settings.smtpUser)
    };

    return NextResponse.json({ settings: safeSettings });

  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const updates = await request.json();
    
    // Validate required fields
    if (!updates.siteName || !updates.adminEmail) {
      return NextResponse.json(
        { error: 'Site name and admin email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.adminEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Update settings
    const updatedSettings = await Settings.updateSettings(updates, session.user.id);
    
    // If maintenance mode was enabled/disabled, log it
    if (typeof updates.maintenanceMode === 'boolean') {
      console.log(`🔧 Maintenance mode ${updates.maintenanceMode ? 'ENABLED' : 'DISABLED'} by ${session.user.name}`);
    }
    
    // If auto-publish was changed, log it
    if (typeof updates.autoPublish === 'boolean') {
      console.log(`📝 Auto-publish ${updates.autoPublish ? 'ENABLED' : 'DISABLED'} by ${session.user.name}`);
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: {
        siteName: updatedSettings.siteName,
        siteDescription: updatedSettings.siteDescription,
        adminEmail: updatedSettings.adminEmail,
        allowRegistration: updatedSettings.allowRegistration,
        requireApproval: updatedSettings.requireApproval,
        autoPublish: updatedSettings.autoPublish,
        maintenanceMode: updatedSettings.maintenanceMode,
        maintenanceMessage: updatedSettings.maintenanceMessage,
        emailEnabled: updatedSettings.emailEnabled,
        maxFileSize: updatedSettings.maxFileSize,
        allowedFileTypes: updatedSettings.allowedFileTypes,
        lastUpdated: updatedSettings.lastUpdated
      }
    });

  } catch (error) {
    console.error('Settings PUT error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
