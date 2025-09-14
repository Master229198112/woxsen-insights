import sgMail from '@sendgrid/mail';
import Office365EmailService from './office365-email-service.js';

// Initialize SendGrid only if not using Office365
if (process.env.USE_OFFICE365 !== 'true' && process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'disabled') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class EmailService {
  constructor() {
    this.useOffice365 = process.env.USE_OFFICE365 === 'true';
    
    if (this.useOffice365) {
      console.log('📧 Using Office365 email service');
      this.emailService = Office365EmailService;
    } else {
      console.log('📧 Using SendGrid email service');
      this.fromEmail = process.env.NEWSLETTER_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL;
      this.fromName = process.env.NEWSLETTER_FROM_NAME || process.env.SENDGRID_FROM_NAME;
      this.replyTo = process.env.NEWSLETTER_REPLY_TO || process.env.SENDGRID_REPLY_TO;
    }
  }

  /**
   * Send a single email
   */
  async sendEmail({ to, subject, html, text = null }) {
    try {
      if (this.useOffice365) {
        return await this.emailService.sendEmail({ to, subject, html, text });
      } else {
        return await this.sendEmailWithSendGrid({ to, subject, html, text });
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send email using SendGrid (legacy method)
   */
  async sendEmailWithSendGrid({ to, subject, html, text = null }) {
    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        replyTo: this.replyTo,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const response = await sgMail.send(msg);
      console.log(`📧 Email sent successfully to ${to}: ${subject}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send bulk emails (newsletter)
   */
  async sendBulkEmails({ emails, subject, html, text = null }) {
    if (this.useOffice365) {
      return await this.emailService.sendBulkEmails({ emails, subject, html, text });
    } else {
      return await this.sendBulkEmailsWithSendGrid({ emails, subject, html, text });
    }
  }

  /**
   * Send bulk emails using SendGrid (legacy method)
   */
  async sendBulkEmailsWithSendGrid({ emails, subject, html, text = null }) {
    const batchSize = 100; // SendGrid batch limit
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    console.log(`📧 Starting bulk email send to ${emails.length} recipients`);

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const messages = batch.map(email => ({
          to: email,
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          replyTo: this.replyTo,
          subject,
          html,
          text: text || this.stripHtml(html)
        }));

        await sgMail.send(messages);
        results.successful += batch.length;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} sent successfully (${batch.length} emails)`);
        
        // Add a small delay between batches to respect rate limits
        if (i + batchSize < emails.length) {
          await this.delay(1000);
        }
      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
        results.failed += batch.length;
        results.errors.push({
          batch: Math.floor(i/batchSize) + 1,
          emails: batch,
          error: error.message
        });
      }
    }

    console.log(`📊 Bulk email results: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }

  /**
   * Send newsletter with unsubscribe links
   */
  async sendNewsletter({ subscribers, subject, content, newsletterId }) {
    if (this.useOffice365) {
      return await this.emailService.sendNewsletter({ subscribers, subject, content, newsletterId });
    } else {
      return await this.sendNewsletterWithSendGrid({ subscribers, subject, content, newsletterId });
    }
  }

  /**
   * Send newsletter using SendGrid (legacy method)
   */
  async sendNewsletterWithSendGrid({ subscribers, subject, content, newsletterId }) {
    console.log(`📧 Sending newsletter "${subject}" to ${subscribers.length} subscribers`);
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    const batchSize = 100;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      try {
        const messages = batch.map(subscriber => ({
          to: subscriber.email,
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          replyTo: this.replyTo,
          subject,
          html: this.addUnsubscribeLink(content, subscriber.unsubscribeToken, newsletterId),
          text: this.stripHtml(content)
        }));

        await sgMail.send(messages);
        results.successful += batch.length;
        console.log(`✅ Newsletter batch ${Math.floor(i/batchSize) + 1} sent successfully (${batch.length} emails)`);
        
        if (i + batchSize < subscribers.length) {
          await this.delay(1000);
        }
      } catch (error) {
        console.error(`❌ Newsletter batch ${Math.floor(i/batchSize) + 1} failed:`, error);
        results.failed += batch.length;
        results.errors.push({
          batch: Math.floor(i/batchSize) + 1,
          subscribers: batch.map(s => s.email),
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Add unsubscribe link to email content
   */
  addUnsubscribeLink(content, unsubscribeToken, newsletterId) {
    const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}&newsletter=${newsletterId}`;
    const footerHtml = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
        <p>You're receiving this email because you subscribed to Woxsen Insights newsletter.</p>
        <p>
          <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a> | 
          <a href="${process.env.NEXTAUTH_URL}" style="color: #666; text-decoration: underline;">Visit Website</a>
        </p>
        <p>© ${new Date().getFullYear()} Woxsen University. All rights reserved.</p>
      </div>
    `;
    
    return content + footerHtml;
  }

  /**
   * Strip HTML tags for plain text version
   */
  stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Delay helper for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(email) {
    if (this.useOffice365) {
      return await this.emailService.sendWelcomeEmail(email);
    } else {
      return await this.sendWelcomeEmailWithSendGrid(email);
    }
  }

  /**
   * Send welcome email using SendGrid (legacy method)
   */
  async sendWelcomeEmailWithSendGrid(email) {
    const subject = 'Welcome to Woxsen Insights Newsletter! 🎉';
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Woxsen Insights!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your weekly dose of innovation and knowledge</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi there! 👋</p>
          
          <p>Thank you for subscribing to Woxsen Insights newsletter! You've just joined our community of innovators, researchers, and knowledge enthusiasts.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">What to expect:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Weekly Digest:</strong> Latest research papers, blog posts, and insights</li>
              <li><strong>Faculty Achievements:</strong> Celebrating our community's success</li>
              <li><strong>Upcoming Events:</strong> Conferences, seminars, and workshops</li>
              <li><strong>Research Highlights:</strong> Cutting-edge discoveries and innovations</li>
              <li><strong>Publication Updates:</strong> New papers and academic contributions</li>
            </ul>
          </div>
          
          <p>We'll send you a comprehensive weekly roundup every <strong>Monday morning</strong> to kickstart your week with inspiration and knowledge.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Woxsen Insights</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Questions? Just reply to this email – we'd love to hear from you!</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}

export default new EmailService();
