'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Loader
} from 'lucide-react';

export default function NewsletterDeliveryStatus() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get('id');

  const [newsletter, setNewsletter] = useState(null);
  const [deliveryStats, setDeliveryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (!newsletterId) {
      router.push('/admin/newsletter');
      return;
    }

    fetchDeliveryStatus();
  }, [session, status, newsletterId, router]);

  // Auto-refresh every 5 seconds if sending is in progress
  useEffect(() => {
    if (!autoRefresh || !deliveryStats) return;

    const hasUnsentEmails = (deliveryStats.pending > 0);
    
    if (hasUnsentEmails) {
      const interval = setInterval(() => {
        fetchDeliveryStatus();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, deliveryStats]);

  const fetchDeliveryStatus = async () => {
    try {
      const [newsletterRes, statsRes] = await Promise.all([
        fetch(`/api/newsletter/send?id=${newsletterId}`),
        fetch(`/api/newsletter/resume?id=${newsletterId}`)
      ]);

      const newsletterData = await newsletterRes.json();
      const statsData = await statsRes.json();

      if (newsletterRes.ok) {
        setNewsletter(newsletterData.newsletter);
      }

      if (statsRes.ok) {
        setDeliveryStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch delivery status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!confirm(`Resume sending to ${deliveryStats.unsentCount} remaining recipients?`)) {
      return;
    }

    try {
      setResuming(true);

      const response = await fetch('/api/newsletter/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsletterId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Resume initiated! Sending to ${data.results.attempted} recipients...`);
        fetchDeliveryStatus();
      } else {
        alert(`Failed to resume: ${data.error}`);
      }
    } catch (error) {
      console.error('Resume error:', error);
      alert('Failed to resume newsletter delivery');
    } finally {
      setResuming(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Loading delivery status...</p>
        </div>
      </div>
    );
  }

  if (!newsletter || !deliveryStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-gray-600">Newsletter not found</p>
              <Link href="/admin/newsletter">
                <Button className="mt-4">Back to Newsletters</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completionPercentage = deliveryStats.completionPercentage || 0;
  const isComplete = deliveryStats.pending === 0 && deliveryStats.failed === 0;
  const canResume = deliveryStats.canResume && !resuming;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/newsletter">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Newsletter Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Newsletter Delivery Status
              </h1>
              <p className="text-gray-600">{newsletter.title}</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <RefreshCw className={`h-4 w-4 mr-2 ${!isComplete && autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh && !isComplete ? 'Auto-refreshing...' : 'Static view'}
              </div>
              <Button
                onClick={fetchDeliveryStatus}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delivery Progress</h3>
              <span className="text-2xl font-bold text-blue-600">
                {completionPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Status Message */}
            <div className="text-center">
              {isComplete ? (
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">All deliveries completed!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center text-blue-600">
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  <span className="font-semibold">
                    {deliveryStats.pending > 0 ? `${deliveryStats.pending} emails pending...` : 'Processing...'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryStats.deliveryStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Successfully Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryStats.deliveryStats.sent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryStats.deliveryStats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveryStats.deliveryStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resume Section */}
        {canResume && (
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Incomplete Delivery Detected
                    </h3>
                    <p className="text-gray-700 mb-2">
                      {deliveryStats.unsentCount} recipients haven't received the newsletter yet.
                    </p>
                    <p className="text-sm text-gray-600">
                      Click Resume to continue sending to the remaining subscribers. The system will pick up where it left off.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleResume}
                  disabled={resuming}
                  className="bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  {resuming ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Resuming...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Resume Sending ({deliveryStats.unsentCount})
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Newsletter Details */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Subject</p>
                <p className="text-gray-900">{newsletter.subject || newsletter.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  newsletter.status === 'sent' ? 'bg-green-100 text-green-800' :
                  newsletter.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                  newsletter.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {newsletter.status}
                </span>
              </div>

              {newsletter.sentDate && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent Date</p>
                  <p className="text-gray-900">{new Date(newsletter.sentDate).toLocaleString()}</p>
                </div>
              )}

              {newsletter.recipientCount && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Target Recipients</p>
                  <p className="text-gray-900">{newsletter.recipientCount}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use This Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Auto-Refresh:</strong> This page automatically refreshes every 5 seconds while emails are being sent.
              </p>
              <p>
                <strong>Resume Functionality:</strong> If the sending process was interrupted, use the "Resume Sending" button to continue.
              </p>
              <p>
                <strong>Tracking:</strong> Every email attempt is tracked individually. The system knows exactly which emails were sent and which failed.
              </p>
              <p>
                <strong>Note:</strong> Email delivery happens in batches of 25 with 2-minute delays between batches to comply with Office365 rate limits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
