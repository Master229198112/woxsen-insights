import crypto from 'crypto';

export class EmailTrackingService {
  static generateTrackingId(newsletterId, subscriberEmail) {
    return crypto
      .createHash('md5')
      .update(`${newsletterId}-${subscriberEmail}-${Date.now()}`)
      .digest('hex');
  }

  static generateTrackingPixelUrl(newsletterId, subscriberEmail, baseUrl = process.env.NEXTAUTH_URL) {
    const trackingId = this.generateTrackingId(newsletterId, subscriberEmail);
    const params = new URLSearchParams({
      newsletter: newsletterId,
      email: subscriberEmail,
      id: trackingId
    });
    
    return `${baseUrl}/api/newsletter/track?${params.toString()}`;
  }

  static generateClickTrackingUrl(originalUrl, newsletterId, subscriberEmail, baseUrl = process.env.NEXTAUTH_URL) {
    const trackingId = this.generateTrackingId(newsletterId, subscriberEmail);
    const params = new URLSearchParams({
      newsletter: newsletterId,
      email: subscriberEmail,
      id: trackingId,
      url: encodeURIComponent(originalUrl)
    });
    
    return `${baseUrl}/api/newsletter/click?${params.toString()}`;
  }

  static addTrackingToEmailContent(htmlContent, newsletterId, subscriberEmail) {
    // Add tracking pixel at the end of email
    const trackingPixelUrl = this.generateTrackingPixelUrl(newsletterId, subscriberEmail);
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
    
    // Replace all links with tracking URLs
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
    const trackedContent = htmlContent.replace(linkRegex, (match, quote, url) => {
      // Skip if it's already a tracking URL or an email/tel link
      if (url.includes('/api/newsletter/') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        return match;
      }
      
      const trackedUrl = this.generateClickTrackingUrl(url, newsletterId, subscriberEmail);
      return match.replace(url, trackedUrl);
    });
    
    // Add tracking pixel before closing body tag
    return trackedContent.replace(/<\/body>/i, `${trackingPixel}</body>`);
  }

  static generateUnsubscribeUrl(subscriberEmail, baseUrl = process.env.NEXTAUTH_URL) {
    const params = new URLSearchParams({
      email: subscriberEmail,
      source: 'newsletter'
    });
    
    return `${baseUrl}/api/newsletter/unsubscribe?${params.toString()}`;
  }
}

export default EmailTrackingService;