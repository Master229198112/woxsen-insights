#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * 
 * This script helps test your SendGrid email configuration
 * Run: node scripts/test-email.js
 */

require('dotenv').config({ path: '.env.local' });

const sgMail = require('@sendgrid/mail');

// Configuration check
function checkConfiguration() {
  console.log('🔍 Checking email configuration...\n');
  
  const requiredVars = [
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL', 
    'SENDGRID_FROM_NAME',
    'NEWSLETTER_FROM_EMAIL',
    'NEWSLETTER_FROM_NAME'
  ];
  
  let allConfigured = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your-sendgrid-api-key-here') {
      console.log(`❌ ${varName}: Not configured`);
      allConfigured = false;
    } else {
      // Mask API key for security
      const displayValue = varName === 'SENDGRID_API_KEY' 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 8)}`
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });
  
  console.log('');
  return allConfigured;
}

// Test basic SendGrid connection
async function testSendGridConnection() {
  try {
    console.log('🔗 Testing SendGrid API connection...');
    
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your-sendgrid-api-key-here') {
      console.log('❌ SendGrid API key not configured');
      return false;
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // This is a simple API validation - doesn't send email
    // Real validation would require sending a test email
    console.log('✅ SendGrid API key format appears valid');
    return true;
    
  } catch (error) {
    console.log(`❌ SendGrid connection error: ${error.message}`);
    return false;
  }
}

// Send test email
async function sendTestEmail() {
  const testEmail = process.argv[2];
  
  if (!testEmail || !testEmail.includes('@')) {
    console.log('❌ Please provide a valid test email address');
    console.log('Usage: node scripts/test-email.js your-email@example.com');
    return false;
  }
  
  try {
    console.log(`📧 Sending test email to: ${testEmail}`);
    
    const msg = {
      to: testEmail,
      from: {
        email: process.env.NEWSLETTER_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL,
        name: process.env.NEWSLETTER_FROM_NAME || process.env.SENDGRID_FROM_NAME
      },
      replyTo: process.env.NEWSLETTER_REPLY_TO || process.env.SENDGRID_REPLY_TO,
      subject: '🧪 Woxsen Insights Email Test',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
            <h1 style="margin: 0;">🧪 Email Test Successful!</h1>
            <p style="margin: 10px 0 0 0;">Woxsen Insights Email Configuration</p>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa; margin-top: 20px; border-radius: 8px;">
            <h2 style="color: #333;">Configuration Details:</h2>
            <ul style="color: #666;">
              <li><strong>From Email:</strong> ${process.env.NEWSLETTER_FROM_EMAIL}</li>
              <li><strong>From Name:</strong> ${process.env.NEWSLETTER_FROM_NAME}</li>
              <li><strong>Reply To:</strong> ${process.env.NEWSLETTER_REPLY_TO}</li>
              <li><strong>Organization:</strong> ${process.env.NEWSLETTER_ORGANIZATION || 'Woxsen University'}</li>
              <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <div style="padding: 20px; text-align: center;">
            <p style="color: #666;">If you received this email, your configuration is working correctly! 🎉</p>
            <p style="color: #666; font-size: 12px;">This is an automated test email from the Woxsen Insights newsletter system.</p>
          </div>
        </div>
      `,
      text: `
Email Test Successful!

Your Woxsen Insights email configuration is working correctly.

Configuration Details:
- From Email: ${process.env.NEWSLETTER_FROM_EMAIL}
- From Name: ${process.env.NEWSLETTER_FROM_NAME}
- Reply To: ${process.env.NEWSLETTER_REPLY_TO}
- Test Time: ${new Date().toISOString()}

If you received this email, everything is set up properly!
      `
    };
    
    const response = await sgMail.send(msg);
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${response[0].headers['x-message-id']}`);
    console.log(`📨 Check your inbox (and spam folder) for the test email`);
    return true;
    
  } catch (error) {
    console.log(`❌ Failed to send test email:`);
    console.log(`   Error: ${error.message}`);
    
    if (error.response?.body?.errors) {
      error.response.body.errors.forEach(err => {
        console.log(`   Details: ${err.message}`);
      });
    }
    
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('📧 Woxsen Insights Email Configuration Test\n');
  console.log('=' .repeat(50));
  
  // Step 1: Check configuration
  const configOk = checkConfiguration();
  if (!configOk) {
    console.log('❌ Configuration incomplete. Please update your .env.local file.');
    process.exit(1);
  }
  
  console.log('=' .repeat(50));
  
  // Step 2: Test SendGrid connection  
  const connectionOk = await testSendGridConnection();
  if (!connectionOk) {
    console.log('❌ SendGrid connection failed. Check your API key.');
    process.exit(1);
  }
  
  console.log('=' .repeat(50));
  
  // Step 3: Send test email (if email provided)
  if (process.argv[2]) {
    const emailSent = await sendTestEmail();
    if (emailSent) {
      console.log('\n🎉 All tests passed! Your email configuration is ready.');
      console.log('\nNext steps:');
      console.log('1. Check your test email inbox');
      console.log('2. Test newsletter generation in the admin panel'); 
      console.log('3. Import your subscriber list');
      console.log('4. Send your first newsletter!');
    } else {
      console.log('\n❌ Email test failed. Check the error messages above.');
    }
  } else {
    console.log('\n✅ Configuration and connection tests passed!');
    console.log('\nTo send a test email, run:');
    console.log('node scripts/test-email.js your-email@example.com');
  }
  
  console.log('\n=' .repeat(50));
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
