// Emergency script to identify and stop excessive API calls
// Add this to browser console to immediately stop runaway polling

console.log('🚨 EMERGENCY API CALL STOPPER - Starting Analysis...');

// 1. Stop all active intervals immediately
let intervalCount = 0;
const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;
const activeIntervals = new Map();

window.setInterval = function(callback, delay, ...args) {
  const id = originalSetInterval.call(this, callback, delay, ...args);
  intervalCount++;
  activeIntervals.set(id, {
    callback: callback.toString().substring(0, 100),
    delay,
    created: new Date().toISOString()
  });
  console.log(`📊 New interval created: ID ${id}, Delay: ${delay}ms`);
  return id;
};

window.clearInterval = function(id) {
  activeIntervals.delete(id);
  intervalCount--;
  console.log(`🛑 Interval cleared: ID ${id}`);
  return originalClearInterval.call(this, id);
};

// 2. Find and stop notification-related intervals
function stopNotificationPolling() {
  console.log('🔍 Scanning for notification polling intervals...');
  
  // Check for active intervals
  console.log(`📊 Active intervals: ${activeIntervals.size}`);
  activeIntervals.forEach((info, id) => {
    console.log(`   ID ${id}: ${info.callback} (${info.delay}ms)`);
    
    // Stop any interval with very short delays that might be polling
    if (info.delay < 60000 && info.callback.includes('fetch')) {
      console.log(`🛑 Stopping suspicious interval ID ${id}`);
      clearInterval(id);
    }
  });
}

// 3. Check for duplicate components
function checkDuplicateComponents() {
  console.log('🔍 Checking for duplicate components...');
  
  const bellComponents = document.querySelectorAll('[data-component="notification-bell"]');
  console.log(`🔔 Notification bell components found: ${bellComponents.length}`);
  
  if (bellComponents.length > 1) {
    console.warn(`⚠️ DUPLICATE COMPONENTS FOUND! This could cause ${bellComponents.length}x API calls!`);
    bellComponents.forEach((component, index) => {
      console.log(`   Component ${index + 1}:`, component);
    });
  }
  
  return bellComponents.length;
}

// 4. Monitor fetch calls for 30 seconds
function monitorAPICallsForDebugging() {
  console.log('📡 Monitoring API calls for 30 seconds...');
  
  const originalFetch = window.fetch;
  const callCounts = {};
  let totalCalls = 0;
  
  window.fetch = async function(...args) {
    const [url] = args;
    totalCalls++;
    
    if (url.includes('/api/')) {
      callCounts[url] = (callCounts[url] || 0) + 1;
      console.log(`🔔 API Call #${totalCalls}: ${url} (Count: ${callCounts[url]})`);
      
      // If same API called more than 3 times in 30 seconds, log warning
      if (callCounts[url] > 3) {
        console.warn(`⚠️ EXCESSIVE CALLS DETECTED: ${url} called ${callCounts[url]} times!`);
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  // Restore original fetch after 30 seconds
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log('📊 API Monitoring Report:');
    console.log(`   Total API calls in 30s: ${totalCalls}`);
    console.log('   Call breakdown:', callCounts);
    
    // Identify the biggest offenders
    const sortedCalls = Object.entries(callCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    console.log('🎯 Top API endpoints by call frequency:');
    sortedCalls.forEach(([url, count]) => {
      console.log(`   ${count}x: ${url}`);
    });
  }, 30000);
}

// 5. Force disable all smart polling temporarily
function emergencyDisablePolling() {
  console.log('🚨 EMERGENCY: Disabling all polling...');
  
  // Override useSmartPolling globally
  window.SMART_POLLING_DISABLED = true;
  
  // Try to find and disable any smart polling instances
  if (window.smartPollingInstances) {
    window.smartPollingInstances.forEach(instance => {
      if (instance.disable) instance.disable();
    });
  }
  
  console.log('✅ All polling disabled. Page will need refresh to re-enable.');
}

// 6. Check browser tab activity
function checkTabActivity() {
  console.log('👁️ Tab activity check:');
  console.log(`   Document hidden: ${document.hidden}`);
  console.log(`   Visibility state: ${document.visibilityState}`);
  console.log(`   Page focus: ${document.hasFocus()}`);
  
  // Add listeners for visibility changes
  document.addEventListener('visibilitychange', () => {
    console.log(`🔄 Tab visibility changed: ${document.hidden ? 'HIDDEN' : 'VISIBLE'}`);
  });
}

// Run the analysis
console.log('\n🚀 Starting Emergency Analysis...\n');

stopNotificationPolling();
const duplicateCount = checkDuplicateComponents();
checkTabActivity();
monitorAPICallsForDebugging();

// If duplicates found, suggest emergency action
if (duplicateCount > 1) {
  console.log('\n🚨 EMERGENCY ACTION REQUIRED:');
  console.log('   Multiple notification components detected!');
  console.log('   Run this to disable all polling:');
  console.log('   emergencyDisablePolling()');
}

console.log('\n✅ Emergency analysis complete. Monitor console for next 30 seconds.');
console.log('\n💡 Quick Actions Available:');
console.log('   - emergencyDisablePolling() : Stop all polling immediately');
console.log('   - stopNotificationPolling() : Stop notification-related intervals');
console.log('   - checkDuplicateComponents() : Scan for duplicate components');

// Make functions available globally
window.emergencyDisablePolling = emergencyDisablePolling;
window.stopNotificationPolling = stopNotificationPolling;
window.checkDuplicateComponents = checkDuplicateComponents;
