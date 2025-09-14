#!/usr/bin/env node

/**
 * Office365 Email Configuration Test Script
 * 
 * This script helps test your Office365 email configuration
 * Run: node scripts/test-office365-email.js your-email@example.com
 */

require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

// Configuration check
function checkConfiguration() {
  console.log('🔍 Checking Office365 email configuration...\n');
  
  const requiredVars = [
    'USE_OFFICE365',
    'SMTP_HOST', 
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'OFFICE365_FROM_EMAIL',
    'OFFICE365_FROM_NAME'
  ];
  
  let allConfigured = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your-regular-office365-password-here') {
      console.log(`❌ ${varName}: Not configured`);
      allConfigured = false;
    } else {
      // Mask password for security
      const displayValue = varName === 'SMTP_PASS' 
        ? '*'.repeat(value.length)
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });
  
  if (process.env.USE_OFFICE365 !== 'true') {
    console.log('❌ Office365 not enabled. Set USE_OFFICE365=true in .env.local');
    allConfigured = false;
  }
  
  console.log('');
  return allConfigured;
}

// Test SMTP connection
async function testSMTPConnection() {
  try {
    console.log('🔗 Testing Office365 SMTP connection...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
    
    await transporter.verify();
    console.log('✅ Office365 SMTP connection successful!');
    return { success: true, transporter };
    
  } catch (error) {
    console.log(`❌ Office365 SMTP connection failed: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Common solutions:');
      console.log('   1. Check if your app password is correct');
      console.log('   2. Ensure SMTP AUTH is enabled for your mailbox');
      console.log('   3. Contact IT team to enable SMTP for sobinsights@woxsen.edu.in');
      console.log('   4. Try generating a new app password');
    }
    
    return { success: false, error };
  }
}

// Send test email
async function sendTestEmail(testEmail, transporter) {
  if (!testEmail || !testEmail.includes('@')) {
    console.log('❌ Please provide a valid test email address');
    console.log('Usage: node scripts/test-office365-email.js your-email@example.com');
    return false;
  }
  
  try {
    console.log(`📧 Sending test email to: ${testEmail}`);
    
    const mailOptions = {
      from: `"${process.env.OFFICE365_FROM_NAME}" <${process.env.OFFICE365_FROM_EMAIL}>`,
      to: testEmail,
      subject: '🧪 Woxsen Insights Office365 Email Test',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
            <h1 style="margin: 0;">🎉 Office365 Email Test Successful!</h1>
            <p style="margin: 10px 0 0 0;">Woxsen Insights Newsletter System</p>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa; margin-top: 20px; border-radius: 8px;">
            <h2 style="color: #333;">Configuration Details:</h2>
            <ul style="color: #666;">
              <li><strong>From Email:</strong> ${process.env.OFFICE365_FROM_EMAIL}</li>
              <li><strong>From Name:</strong> ${process.env.OFFICE365_FROM_NAME}</li>
              <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
              <li><strong>SMTP User:</strong> ${process.env.SMTP_USER}</li>
              <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <div style="padding: 20px; text-align: center;">
            <p style="color: #666;">If you received this email, your Office365 configuration is working correctly! 🎉</p>
            <p style="color: #666; font-size: 12px;">
              This email was sent directly from sobinsights@woxsen.edu.in using Office365 SMTP.
              <br>No third-party email services were used.
            </p>
          </div>
          
          <div style="padding: 20px; background: #e8f5e8; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #2d5a2d; margin-top: 0;">✅ What this means:</h3>
            <ul style="color: #2d5a2d; margin: 0;">
              <li>Your Office365 email configuration is working</li>
              <li>Newsletter sending will work through your Woxsen email</li>
              <li>No third-party email services are needed</li>
              <li>Your emails will come from your official domain</li>
            </ul>
          </div>
        </div>
      `,
      text: `
Office365 Email Test Successful!

Your Woxsen Insights Office365 email configuration is working correctly.

Configuration Details:
- From Email: ${process.env.OFFICE365_FROM_EMAIL}
- From Name: ${process.env.OFFICE365_FROM_NAME}
- SMTP Host: ${process.env.SMTP_HOST}
- SMTP Port: ${process.env.SMTP_PORT}
- Test Time: ${new Date().toISOString()}

This email was sent directly from sobinsights@woxsen.edu.in using Office365 SMTP.
No third-party email services were used.

If you received this email, everything is set up properly for newsletter sending!
      `,
      replyTo: process.env.OFFICE365_FROM_EMAIL
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${result.messageId}`);
    console.log(`📨 Check your inbox (and spam folder) for the test email`);
    console.log(`📧 Email sent from: ${process.env.OFFICE365_FROM_EMAIL}`);
    return true;
    
  } catch (error) {
    console.log(`❌ Failed to send test email:`);
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed during sending. This could mean:');
      console.log('   1. Your app password expired or is incorrect');
      console.log('   2. SMTP AUTH was disabled for your account');
      console.log('   3. Contact IT team to verify SMTP settings');
    }
    
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('📧 Woxsen Insights Office365 Email Configuration Test\n');
  console.log('=' .repeat(60));
  
  // Step 1: Check configuration
  const configOk = checkConfiguration();
  if (!configOk) {
    console.log('❌ Configuration incomplete. Please update your .env.local file.');
    console.log('\n💡 Next steps:');
    console.log('   1. Set USE_OFFICE365=true');
    console.log('   2. Configure SMTP settings for Office365');
    console.log('   3. Get app password from Microsoft 365 admin');
    console.log('   4. Contact IT team if needed');
    process.exit(1);
  }
  
  console.log('=' .repeat(60));
  
  // Step 2: Test SMTP connection  
  const connectionResult = await testSMTPConnection();
  if (!connectionResult.success) {
    console.log('❌ Office365 SMTP connection failed. Check your credentials and settings.');
    process.exit(1);
  }
  
  console.log('=' .repeat(60));
  
  // Step 3: Send test email (if email provided)
  if (process.argv[2]) {
    const emailSent = await sendTestEmail(process.argv[2], connectionResult.transporter);
    if (emailSent) {
      console.log('\n🎉 All tests passed! Your Office365 email configuration is ready.');
      console.log('\n✅ Benefits of using Office365:');
      console.log('   • No third-party dependencies');
      console.log('   • Uses your existing Woxsen infrastructure');
      console.log('   • Professional email delivery');
      console.log('   • Built-in compliance and security');
      console.log('\n📋 Next steps:');
      console.log('   1. Check your test email inbox');
      console.log('   2. Test newsletter generation in admin panel'); 
      console.log('   3. Import your subscriber list');
      console.log('   4. Send your first newsletter via Office365!');
    } else {
      console.log('\n❌ Email test failed. Check the error messages above.');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Verify app password is correct');
      console.log('   2. Check if SMTP AUTH is enabled');
      console.log('   3. Contact IT team for Office365 settings');
    }
  } else {
    console.log('\n✅ Configuration and connection tests passed!');
    console.log('\nTo send a test email, run:');
    console.log('node scripts/test-office365-email.js your-email@example.com');
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Handle missing dependencies
async function checkDependencies() {
  try {
    require('nodemailer');
    return true;
  } catch (error) {
    console.log('❌ Missing dependencies. Please install:');
    console.log('npm install nodemailer');
    console.log('\nOr if you want all Office365 features:');
    console.log('npm install nodemailer @microsoft/microsoft-graph-client');
    return false;
  }
}

// Run the tests
checkDependencies().then(depsOk => {
  if (depsOk) {
    runTests().catch(error => {
      console.error('❌ Test script error:', error);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
