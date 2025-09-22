// lib/email-batch-config.js

export const EMAIL_BATCH_CONFIG = {
  // Batch settings - optimized for Office365
  BATCH_SIZE: 25,              // Emails per batch (Office365 optimized)
  BATCH_DELAY: 3000,           // Milliseconds between batches (3 seconds)
  
  // Retry settings
  RETRY_ATTEMPTS: 3,           // Number of retry attempts for failed emails
  RETRY_DELAY: 5000,           // Milliseconds between retries (5 seconds)
  
  // Progress monitoring
  PROGRESS_CHECK_INTERVAL: 3000,  // How often to check batch progress (3 seconds)
  
  // Email provider specific settings
  PROVIDERS: {
    office365: {
      BATCH_SIZE: 25,          // Office365 can handle 30/minute, so 25 is safe
      BATCH_DELAY: 3000,       // 3 seconds between batches (safer than 2 minutes/30 emails)
      DAILY_LIMIT: 10000,      // Standard Office365 daily limit
      CONNECTION_POOL: 2       // Limit concurrent connections
    },
    gmail: {
      BATCH_SIZE: 15,          // Gmail has stricter limits
      BATCH_DELAY: 3000,       // Longer delay for Gmail
      DAILY_LIMIT: 500         // Gmail daily sending limit
    },
    sendgrid: {
      BATCH_SIZE: 25,          // SendGrid can handle more
      BATCH_DELAY: 1000,       // Shorter delay
      DAILY_LIMIT: 10000       // Higher daily limit
    },
    mailgun: {
      BATCH_SIZE: 30,
      BATCH_DELAY: 1500,
      DAILY_LIMIT: 5000
    },
    smtp: {
      BATCH_SIZE: 10,          // Conservative for generic SMTP
      BATCH_DELAY: 5000,       // Longer delays for safety
      DAILY_LIMIT: 1000
    }
  }
};

// Function to get provider-specific config
export function getProviderConfig(provider = 'office365') {
  const providerConfig = EMAIL_BATCH_CONFIG.PROVIDERS[provider.toLowerCase()];
  
  if (!providerConfig) {
    console.warn(`Unknown email provider: ${provider}. Using Office365 settings as default.`);
    return EMAIL_BATCH_CONFIG.PROVIDERS.office365;
  }
  
  return providerConfig;
}

// Function to calculate estimated sending time
export function estimateSendingTime(recipientCount, provider = 'office365') {
  const config = getProviderConfig(provider);
  const batches = Math.ceil(recipientCount / config.BATCH_SIZE);
  const totalDelayTime = (batches - 1) * config.BATCH_DELAY; // No delay after last batch
  const averageEmailTime = 500; // Estimated 500ms per email processing
  const totalProcessingTime = recipientCount * averageEmailTime;
  
  const totalTimeMs = totalDelayTime + totalProcessingTime;
  const totalTimeMinutes = Math.ceil(totalTimeMs / 1000 / 60);
  
  return {
    batches,
    estimatedTimeMinutes: totalTimeMinutes,
    estimatedTimeMs: totalTimeMs
  };
}

// Function to check if sending is within daily limits
export function checkDailyLimit(recipientCount, sentToday, provider = 'office365') {
  const config = getProviderConfig(provider);
  const remainingQuota = config.DAILY_LIMIT - sentToday;
  
  return {
    canSend: recipientCount <= remainingQuota,
    remainingQuota,
    dailyLimit: config.DAILY_LIMIT,
    wouldExceed: recipientCount > remainingQuota
  };
}

// Environment-based configuration
export function getActiveConfig() {
  const provider = process.env.EMAIL_PROVIDER || 'office365'; // Default to office365
  const config = getProviderConfig(provider);
  
  // Allow environment overrides
  return {
    ...config,
    BATCH_SIZE: parseInt(process.env.EMAIL_BATCH_SIZE) || config.BATCH_SIZE,
    BATCH_DELAY: parseInt(process.env.EMAIL_BATCH_DELAY) || config.BATCH_DELAY,
    RETRY_ATTEMPTS: parseInt(process.env.EMAIL_RETRY_ATTEMPTS) || EMAIL_BATCH_CONFIG.RETRY_ATTEMPTS,
    RETRY_DELAY: parseInt(process.env.EMAIL_RETRY_DELAY) || EMAIL_BATCH_CONFIG.RETRY_DELAY,
    DAILY_LIMIT: parseInt(process.env.EMAIL_DAILY_LIMIT) || config.DAILY_LIMIT,
  };
}

export default EMAIL_BATCH_CONFIG;