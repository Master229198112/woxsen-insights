import crypto from 'crypto';

export class EmailTrackingUtils {
  
  /**
   * Generate a unique subscriber ID for tracking (hashed email for privacy)
   */
  static generateSubscriberId(email) {
    return crypto
      .createHash('sha256')
      .update(email + process.env.TRACKING_SECRET || 'default-secret')
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate tracking pixel URL for open tracking
   */
  static generateOpenTrackingUrl(newsletterId, subscriberEmail) {
    const subscriberId = this.generateSubscriberId(subscriberEmail);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    return `${baseUrl}/api/newsletter/tracking/open?n=${newsletterId}&s=${subscriberId}`;
  }

  /**
   * Generate tracked click URL
   */
  static generateClickTrackingUrl(newsletterId, subscriberEmail, targetUrl) {
    const subscriberId = this.generateSubscriberId(subscriberEmail);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const encodedUrl = encodeURIComponent(targetUrl);
    
    return `${baseUrl}/api/newsletter/tracking/click?n=${newsletterId}&s=${subscriberId}&url=${encodedUrl}`;
  }

  /**
   * Process email content to add tracking
   */
  static addTrackingToEmailContent(content, newsletterId, subscriberEmail) {
    let trackedContent = content;

    // Add tracking pixel at the end of the email
    const trackingPixel = `<img src="${this.generateOpenTrackingUrl(newsletterId, subscriberEmail)}" width="1" height="1" style="display:none;" alt="">`;
    trackedContent += trackingPixel;

    // Replace all links with tracked links
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
    trackedContent = trackedContent.replace(linkRegex, (match, quote, url) => {
      // Skip mailto links and already tracked links
      if (url.startsWith('mailto:') || url.includes('/api/newsletter/tracking/')) {
        return match;
      }

      const trackedUrl = this.generateClickTrackingUrl(newsletterId, subscriberEmail, url);
      return match.replace(url, trackedUrl);
    });

    return trackedContent;
  }

  /**
   * Generate unsubscribe URL
   */
  static generateUnsubscribeUrl(subscriberEmail, unsubscribeToken) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(subscriberEmail)}&token=${unsubscribeToken}`;
  }
}

export default EmailTrackingUtils;