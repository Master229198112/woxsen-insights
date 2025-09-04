import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

// Cache settings for performance
let settingsCache = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getSettings(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && settingsCache && cacheTime && (now - cacheTime < CACHE_DURATION)) {
    return settingsCache;
  }

  try {
    await connectDB();
    const settings = await Settings.getSettings();
    
    settingsCache = settings;
    cacheTime = now;
    
    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings if database is unavailable
    return {
      allowRegistration: true,
      requireApproval: true,
      autoPublish: false,
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing scheduled maintenance.'
    };
  }
}

export function clearSettingsCache() {
  settingsCache = null;
  cacheTime = null;
}
