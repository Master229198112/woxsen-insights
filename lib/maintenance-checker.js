// Maintenance Status Checker - For API Routes Only (Not Middleware)
import connectDB from '@/lib/mongodb';

let cachedMaintenanceStatus = null;
let cacheExpiry = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

/**
 * Get maintenance status with caching - FOR API ROUTES ONLY
 * Do not use in middleware due to edge runtime limitations
 */
export async function getMaintenanceStatus() {
  try {
    // Return cached value if still valid
    const now = Date.now();
    if (cachedMaintenanceStatus !== null && now < cacheExpiry) {
      return cachedMaintenanceStatus;
    }

    // Connect to database and fetch fresh status
    await connectDB();
    
    // Import Settings model dynamically to avoid edge runtime issues
    const { default: Settings } = await import('@/models/Settings');
    const settings = await Settings.getSettings();
    
    // Cache the result
    cachedMaintenanceStatus = settings.maintenanceMode || false;
    cacheExpiry = now + CACHE_DURATION;
    
    return cachedMaintenanceStatus;
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    
    // If we have a cached value, use it even if expired
    if (cachedMaintenanceStatus !== null) {
      return cachedMaintenanceStatus;
    }
    
    // Otherwise, fail-open (allow access)
    return false;
  }
}

/**
 * Clear the maintenance status cache (call this when settings are updated)
 */
export function clearMaintenanceCache() {
  cachedMaintenanceStatus = null;
  cacheExpiry = 0;
}

/**
 * Get maintenance status and message for public API - FOR API ROUTES ONLY
 */
export async function getMaintenanceInfo() {
  try {
    await connectDB();
    
    // Import Settings model dynamically
    const { default: Settings } = await import('@/models/Settings');
    const settings = await Settings.getSettings();
    
    return {
      maintenanceMode: settings.maintenanceMode || false,
      maintenanceMessage: settings.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'
    };
  } catch (error) {
    console.error('Error getting maintenance info:', error);
    return {
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.'
    };
  }
}