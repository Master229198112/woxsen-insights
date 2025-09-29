import nodemailer from 'nodemailer';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientCredentialProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

class Office365EmailService {
  constructor() {
    this.useGraph = process.env.USE_GRAPH_API === 'true';
    this.fromEmail = process.env.OFFICE365_FROM_EMAIL || 'sobinsights@woxsen.edu.in';
    this.fromName = process.env.OFFICE365_FROM_NAME || 'Woxsen Insights';
    
    if (this.useGraph) {
      this.initializeGraphClient();
    } else {
      this.initializeSMTPTransporter();
    }
  }

  /**
   * Initialize Microsoft Graph client
   */
  initializeGraphClient() {
    try {
      const clientId = process.env.AZURE_CLIENT_ID;
      const clientSecret = process.env.AZURE_CLIENT_SECRET;
      const tenantId = process.env.AZURE_TENANT_ID;

      if (!clientId || !clientSecret || !tenantId) {
        console.warn('⚠️ Graph API credentials missing, falling back to SMTP');
        this.useGraph = false;
        this.initializeSMTPTransporter();
        return;
      }

      const authProvider = new ClientCredentialProvider({
        clientId,
        clientSecret,
        tenantId,
      });

      this.graphClient = Client.initWithMiddleware({ authProvider });
      console.log('✅ Microsoft Graph client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Graph client:', error);
      this.useGraph = false;
      this.initializeSMTPTransporter();
    }
  }

  /**
   * Initialize SMTP transporter for Office365
   */
  initializeSMTPTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.office365.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // false for STARTTLS
        auth: {
          user: process.env.SMTP_USER || this.fromEmail,
          pass: process.env.SMTP_PASS // App password
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });

      console.log('✅ Office365 SMTP transporter initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SMTP transporter:', error);
      throw error;
    }
  }

  /**
   * Send email using Microsoft Graph API
   */
  async sendEmailWithGraph({ to, subject, html, text }) {
    try {
      const message = {
        subject,
        body: {
          contentType: 'HTML',
          content: html
        },
        toRecipients: [{
          emailAddress: {
            address: to
          }
        }],
        from: {
          emailAddress: {
            address: this.fromEmail,
            name: this.fromName
          }
        },
        replyTo: [{
          emailAddress: {
            address: this.fromEmail
          }
        }]
      };

      await this.graphClient
        .api(`/users/${this.fromEmail}/sendMail`)
        .post({ message });

      console.log(`📧 Email sent via Graph API to ${to}: ${subject}`);
      return { success: true, method: 'graph' };
    } catch (error) {
      console.error('❌ Graph API email failed:', error);
      throw error;
    }
  }

  /**
   * Send email using SMTP
   */
  async sendEmailWithSMTP({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
        replyTo: this.fromEmail
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent via SMTP to ${to}: ${subject}`);
      return { success: true, messageId: result.messageId, method: 'smtp' };
    } catch (error) {
      console.error('❌ SMTP email failed:', error);
      throw error;
    }
  }

  /**
   * Send single email (public method)
   */
  async sendEmail({ to, subject, html, text = null }) {
    try {
      if (this.useGraph && this.graphClient) {
        return await this.sendEmailWithGraph({ to, subject, html, text });
      } else {
        return await this.sendEmailWithSMTP({ to, subject, html, text });
      }
    } catch (error) {
      throw new Error(`Failed to send email via Office365: ${error.message}`);
    }
  }

  /**
   * Send bulk emails with optimized rate limiting
   */
  async sendBulkEmails({ emails, subject, html, text = null }) {
    const batchSize = 25; // Optimized batch size for Office365
    const delayBetweenBatches = 3000; // 3 seconds delay between batches (much faster)
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    console.log(`📧 Starting optimized bulk email send to ${emails.length} recipients via Office365`);

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`📦 Processing batch ${batchNumber} (${batch.length} emails)`);
      
      // Process batch sequentially to respect rate limits
      for (const email of batch) {
        try {
          await this.sendEmail({ to: email, subject, html, text });
          results.successful++;
          
          // Reduced delay between individual emails
          await this.delay(200); // 200ms between emails (much faster)
        } catch (error) {
          console.error(`❌ Failed to send to ${email}:`, error.message);
          results.failed++;
          results.errors.push({
            email,
            error: error.message
          });
        }
      }

      // Shorter delay between batches
      if (i + batchSize < emails.length) {
        console.log(`⏱️ Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
        await this.delay(delayBetweenBatches);
      }
    }

    console.log(`📊 Bulk email results: ${results.successful} successful, ${results.failed} failed`);
    return results;
  }

  /**
   * Send newsletter with unsubscribe links
   */
  async sendNewsletter({ subscribers, subject, content, newsletterId }) {
    console.log(`📧 Sending newsletter "${subject}" to ${subscribers.length} subscribers via Office365`);
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    const batchSize = 25; // Conservative batch size for newsletters
    const delayBetweenBatches = 120000; // 2 minutes between batches
    const NewsletterDelivery = (await import('@/models/NewsletterDelivery')).default;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`📦 Processing newsletter batch ${batchNumber} (${batch.length} subscribers)`);
      
      for (const subscriber of batch) {
        try {
          const personalizedContent = this.addUnsubscribeLink(
            content, 
            subscriber.unsubscribeToken, 
            newsletterId
          );
          
          const emailResult = await this.sendEmail({
            to: subscriber.email,
            subject,
            html: personalizedContent,
            text: this.stripHtml(personalizedContent)
          });
          
          // Record successful delivery
          await NewsletterDelivery.findOneAndUpdate(
            { newsletterId, email: subscriber.email },
            {
              newsletterId,
              email: subscriber.email,
              status: 'sent',
              sentAt: new Date(),
              messageId: emailResult.messageId,
              attempts: 1,
              lastAttemptAt: new Date()
            },
            { upsert: true, new: true }
          );
          
          results.successful++;
          
          // Delay between individual newsletter emails
          await this.delay(3000); // 3 seconds between emails
        } catch (error) {
          console.error(`❌ Failed to send newsletter to ${subscriber.email}:`, error.message);
          
          // Record failed delivery
          try {
            await NewsletterDelivery.findOneAndUpdate(
              { newsletterId, email: subscriber.email },
              {
                newsletterId,
                email: subscriber.email,
                status: 'failed',
                attempts: 1,
                lastAttemptAt: new Date(),
                error: error.message,
                failureReason: error.message
              },
              { upsert: true, new: true }
            );
          } catch (recordError) {
            console.error('Failed to record delivery failure:', recordError);
          }
          
          results.failed++;
          results.errors.push({
            email: subscriber.email,
            error: error.message
          });
        }
      }

      // Delay between batches
      if (i + batchSize < subscribers.length) {
        console.log(`⏱️ Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
        await this.delay(delayBetweenBatches);
      }
    }

    return results;
  }

  /**
   * Resume sending newsletter to failed/unsent recipients (OPTIMIZED)
   */
  async sendNewsletterResume({ subscribers, subject, content, newsletterId }) {
    console.log(`🔄 Resuming newsletter "${subject}" to ${subscribers.length} recipients via Office365 (OPTIMIZED)`);
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    const batchSize = 25; // Increased batch size
    const delayBetweenBatches = 3000; // Reduced to 3 seconds
    const NewsletterDelivery = (await import('@/models/NewsletterDelivery')).default;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`📦 Processing optimized resume batch ${batchNumber} (${batch.length} subscribers)`);
      
      for (const subscriber of batch) {
        try {
          const personalizedContent = this.addUnsubscribeLink(
            content, 
            subscriber.unsubscribeToken, 
            newsletterId
          );
          
          const emailResult = await this.sendEmail({
            to: subscriber.email,
            subject,
            html: personalizedContent,
            text: this.stripHtml(personalizedContent)
          });
          
          // Record successful delivery
          await NewsletterDelivery.findOneAndUpdate(
            { newsletterId, email: subscriber.email },
            {
              newsletterId,
              email: subscriber.email,
              status: 'sent',
              sentAt: new Date(),
              messageId: emailResult.messageId,
              attempts: 1,
              lastAttemptAt: new Date()
            },
            { upsert: true, new: true }
          );
          
          results.successful++;
          
          // Much shorter delay between individual emails
          await this.delay(200); // Reduced from 4000ms to 200ms
        } catch (error) {
          console.error(`❌ Failed to resume newsletter to ${subscriber.email}:`, error.message);
          
          // Record failed delivery
          try {
            await NewsletterDelivery.findOneAndUpdate(
              { newsletterId, email: subscriber.email },
              {
                newsletterId,
                email: subscriber.email,
                status: 'failed',
                attempts: 1,
                lastAttemptAt: new Date(),
                error: error.message,
                failureReason: error.message
              },
              { upsert: true, new: true }
            );
          } catch (recordError) {
            console.error('Failed to record delivery failure:', recordError);
          }
          
          results.failed++;
          results.errors.push({
            email: subscriber.email,
            error: error.message
          });
        }
      }

      // Much shorter delay between batches
      if (i + batchSize < subscribers.length) {
        console.log(`⏱️ Waiting ${delayBetweenBatches/1000} seconds before next resume batch...`);
        await this.delay(delayBetweenBatches);
      }
    }

    console.log(`📊 Newsletter resume results: ${results.successful} successful, ${results.failed} failed`);
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
        <p style="font-size: 10px; color: #999;">
          Sent from sobinsights@woxsen.edu.in via Woxsen University Office365
        </p>
      </div>
    `;
    
    return content + footerHtml;
  }

  /**
   * Send welcome email to new subscriber
   */
  async sendWelcomeEmail(email) {
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
          
          <p style="color: #666; font-size: 14px;">Questions? Just reply to this email at sobinsights@woxsen.edu.in – we'd love to hear from you!</p>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} Woxsen University. All rights reserved.<br>
            Sent from sobinsights@woxsen.edu.in
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Test email connectivity
   */
  async testConnection() {
    try {
      if (this.useGraph && this.graphClient) {
        // Test Graph API connection
        await this.graphClient.api(`/users/${this.fromEmail}`).get();
        return { success: true, method: 'graph', message: 'Graph API connection successful' };
      } else {
        // Test SMTP connection
        await this.transporter.verify();
        return { success: true, method: 'smtp', message: 'SMTP connection successful' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
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
}

export default new Office365EmailService();
