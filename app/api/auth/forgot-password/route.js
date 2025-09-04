import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

// Note: For production, you'll need to implement actual email sending
// This is a simplified version for development
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  
  console.log('🔗 Password Reset Link:', resetUrl);
  console.log('📧 Would send email to:', email);
  
  // In production, replace this with actual email service like:
  // - Nodemailer with SMTP
  // - SendGrid
  // - AWS SES
  // - Resend
  
  return true; // Simulate successful email sending
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
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message: 'If an account exists with that email, password reset instructions have been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
