import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import office365EmailService from '@/lib/office365-email-service';

async function sendPasswordResetEmail(email, resetToken, userName) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://sobinsights.aircwou.in'}/auth/reset-password?token=${resetToken}`;
  
  const subject = 'Reset Your Password - Woxsen Insights';
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Woxsen Insights</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hello${userName ? ' ' + userName : ''}! 👋</p>
        
        <p>We received a request to reset the password for your Woxsen Insights account.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0 0 15px 0;"><strong>⚠️ Important Security Information:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>This link will expire in <strong>1 hour</strong></li>
            <li>You can only use this link once</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
        </div>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="background: #f8f9fa; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #667eea;">${resetUrl}</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            <strong>Didn't request this?</strong><br>
            If you didn't request a password reset, someone may be trying to access your account. Please contact us immediately at <a href="mailto:sobinsights@woxsen.edu.in" style="color: #667eea;">sobinsights@woxsen.edu.in</a>
          </p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-top: 1px solid #eee;">
        <p style="margin: 0; color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} Woxsen University. All rights reserved.<br>
          School of Business - Woxsen Insights Platform<br>
          Sent from sobinsights@woxsen.edu.in
        </p>
      </div>
    </div>
  `;

  try {
    await office365EmailService.sendEmail({
      to: email,
      subject,
      html
    });
    
    console.log('✅ Password reset email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security, don't reveal if email exists or not
      // But still return success message
      return NextResponse.json({
        message: 'If an account exists with that email, password reset instructions have been sent.'
      });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    return NextResponse.json({
      message: 'If an account exists with that email, password reset instructions have been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Check if it's an email sending error
    if (error.message.includes('Failed to send password reset email')) {
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again later or contact support.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
