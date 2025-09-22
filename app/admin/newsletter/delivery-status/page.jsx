'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Mail, Users, RefreshCw, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DeliveryStatusPage = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/admin/newsletter');
      const data = await response.json();
      setNewsletters(data.newsletters || []);
    } catch (error) {
      console.error('Failed to fetch newsletters:', error);
    }
  };

  const checkDeliveryStatus = async (newsletterId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/newsletter/delivery-status?newsletterId=${newsletterId}`);
      const data = await response.json();
      
      if (response.ok) {
        setDeliveryStatus(data);
        setSelectedNewsletter(data.newsletter);
      } else {
        alert('Failed to get delivery status: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to check delivery status:', error);
      alert('Failed to check delivery status');
    } finally {
      setLoading(false);
    }
  };

  const resumeSending = async (newsletterId, resumeType) => {
    if (!confirm(`Are you sure you want to resume sending to ${resumeType} recipients?`)) {
      return;
    }

    setResuming(true);
    try {
      const response = await fetch('/api/admin/newsletter/resume-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId, resumeType })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Resume completed: ${data.results.successful} sent, ${data.results.failed} failed`);
        // Refresh delivery status
        await checkDeliveryStatus(newsletterId);
        // Refresh newsletter list
        await fetchNewsletters();
      } else {
        alert('Failed to resume sending: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to resume sending:', error);
      alert('Failed to resume sending');
    } finally {
      setResuming(false);
    }
  };

  const downloadFailedList = () => {
    if (!deliveryStatus) return;
    
    const failedEmails = (deliveryStatus.failedEmails || []).concat(deliveryStatus.notAttemptedEmails || []);
    const csv = 'Email\n' + failedEmails.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-emails-${selectedNewsletter?.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          href="/admin/newsletter"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Newsletter Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Delivery Status</h1>
        <p className="text-gray-600">Track and resume failed newsletter deliveries</p>
      </div>

      {/* Newsletter List */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Newsletters</h2>
          
          {newsletters.length === 0 ? (
            <p className="text-gray-500">No newsletters found</p>
          ) : (
            <div className="space-y-4">
              {newsletters.map((newsletter) => (
                <div key={newsletter._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {newsletter.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{newsletter.subject}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          newsletter.status === 'sent' ? 'bg-green-100 text-green-800' :
                          newsletter.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                          newsletter.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {newsletter.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          {newsletter.successfulSends || 0}/{newsletter.recipientCount || 0} sent
                        </span>
                        {newsletter.failedSends > 0 && (
                          <span className="text-red-600">
                            {newsletter.failedSends} failed
                          </span>
                        )}
                        <span className="text-gray-500">
                          {new Date(newsletter.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => checkDeliveryStatus(newsletter._id)}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                        Check Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Status Details */}
      {deliveryStatus && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Details</h2>
              <p className="text-gray-600 mb-6">{deliveryStatus.newsletter.title}</p>
              
              {/* Status Overview */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{deliveryStatus.deliverySummary?.total || 0}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{deliveryStatus.deliverySummary?.sent || 0}</div>
                  <div className="text-sm text-gray-600">Sent</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">{deliveryStatus.deliverySummary?.failed || 0}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-600">{deliveryStatus.deliverySummary?.pending || 0}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <div className="text-2xl font-bold text-gray-600">{deliveryStatus.deliverySummary?.notAttempted || 0}</div>
                  <div className="text-sm text-gray-600">Not Sent</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => resumeSending(selectedNewsletter.id, 'failed')}
                  disabled={resuming || (deliveryStatus.deliverySummary?.failed || 0) === 0}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resuming ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Retry Failed ({deliveryStatus.deliverySummary?.failed || 0})
                </button>
                
                <button
                  onClick={() => resumeSending(selectedNewsletter.id, 'unsent')}
                  disabled={resuming || (deliveryStatus.deliverySummary?.notAttempted || 0) === 0}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resuming ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  Send to Remaining ({deliveryStatus.deliverySummary?.notAttempted || 0})
                </button>

                <button
                  onClick={() => resumeSending(selectedNewsletter.id, 'all')}
                  disabled={resuming || ((deliveryStatus.deliverySummary?.failed || 0) + (deliveryStatus.deliverySummary?.notAttempted || 0) === 0)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resuming ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Send to All Unsent ({(deliveryStatus.deliverySummary?.failed || 0) + (deliveryStatus.deliverySummary?.notAttempted || 0)})
                </button>

                <button
                  onClick={downloadFailedList}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Unsent List
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${deliveryStatus.deliverySummary?.total > 0 ? 
                      ((deliveryStatus.deliverySummary?.sent || 0) / deliveryStatus.deliverySummary.total) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="text-sm text-gray-600 text-center">
                {deliveryStatus.deliverySummary?.total > 0 ? 
                  Math.round(((deliveryStatus.deliverySummary?.sent || 0) / deliveryStatus.deliverySummary.total) * 100) : 0}% delivered successfully
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">What to do next:</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <strong>Retry Failed:</strong> Resend to emails that failed delivery
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <strong>Send to Remaining:</strong> Send to subscribers who haven't received it yet
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <strong>Send to All Unsent:</strong> Send to both failed and unsent subscribers in one operation
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatusPage;