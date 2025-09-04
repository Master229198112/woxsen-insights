'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setMessage({ 
          type: 'success', 
          text: 'Password reset instructions have been sent to your email address.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to send reset email. Please try again.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot Password
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link 
                  href="/auth/signin"
                  className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message.text && (
                    <div className={`flex items-center p-4 text-sm rounded-lg ${
                      message.type === 'success' 
                        ? 'text-green-700 bg-green-50 border border-green-200' 
                        : 'text-red-700 bg-red-50 border border-red-200'
                    }`}>
                      {message.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      )}
                      {message.text}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                        placeholder="Enter your email address"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      We'll send password reset instructions to this email address
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending Reset Link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Check Your Email</h3>
                  <p className="text-gray-600">
                    We've sent password reset instructions to:
                  </p>
                  <p className="font-medium text-gray-900">{email}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Please check your inbox and click the reset link.</p>
                    <p>The link will expire in 1 hour for security reasons.</p>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                        setMessage({ type: '', text: '' });
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Resend Email
                    </Button>
                    <Link href="/auth/signin" className="block">
                      <Button variant="ghost" className="w-full">
                        Back to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
