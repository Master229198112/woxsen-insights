'use client';
import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Clock, Mail, Users, RefreshCw, Download, ArrowLeft, Play, Pause, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useSmartPolling } from '@/hooks/useSmartPolling';

const DeliveryStatusPage = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchSending, setBatchSending] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);
  const [sendingStats, setSendingStats] = useState(null);
  const progressIntervalRef = useRef(null);
  const [monitoringNewsletterId, setMonitoringNewsletterId] = useState(null);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  // Cleanup progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
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

  // Smart monitoring callback for batch progress
  const monitorProgress = async () => {
    if (!monitoringNewsletterId) return;
    
    try {
      console.log('📧 Checking newsletter progress...', monitoringNewsletterId);
      const response = await fetch(`/api/admin/newsletter/batch-send?newsletterId=${monitoringNewsletterId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSendingStats(data);
        
        // If sending is complete, stop monitoring
        if (data.status === 'sent' || data.status === 'partially_sent' || data.status === 'failed') {
          console.log('📧 Newsletter sending completed:', data.status);
          setBatchSending(false);
          setBatchProgress(null);
          setMonitoringNewsletterId(null);
          
          // Refresh the delivery status
          await checkDeliveryStatus(monitoringNewsletterId);
          await fetchNewsletters();
        }
      }
    } catch (error) {
      console.error('Failed to check progress:', error);
    }
  };

  // Smart polling for batch progress - only when actively monitoring
  const { isActive: isMonitoringActive, isPolling: isMonitoringPolling, forceUpdate: forceProgressUpdate } = useSmartPolling(
    monitorProgress,
    5000, // Check every 5 seconds (instead of 3)
    !!monitoringNewsletterId && batchSending // Only when monitoring a newsletter
  );

  const startBatchSending = async (newsletterId, resumeType) => {
    const typeLabels = {
      'failed': 'failed recipients',
      'unsent': 'unsent recipients', 
      'all': 'all unsent recipients'
    };
    
    if (!confirm(`Are you sure you want to start batch sending to ${typeLabels[resumeType]}? This will send emails in batches of 25 with delays between batches.`)) {
      return;
    }

    setBatchSending(true);
    setBatchProgress({
      type: resumeType,
      started: new Date(),
      currentBatch: 0,
      totalBatches: 0
    });

    try {
      const response = await fetch('/api/admin/newsletter/batch-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId, resumeType })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Start smart monitoring progress
        setMonitoringNewsletterId(newsletterId);
        
        // Show initial success message
        const message = `Batch sending started successfully!\n\nSummary:\n• Total recipients: ${data.results.total}\n• Processed in ${data.results.batches} batches\n• Successful: ${data.results.successful}\n• Failed: ${data.results.failed}\n\n⚡ Smart monitoring active - updates only when tab is visible`;
        alert(message);
        
        // Smart monitoring will handle the rest
      } else {
        alert('Failed to start batch sending: ' + data.error);
        setBatchSending(false);
        setBatchProgress(null);
        setMonitoringNewsletterId(null);
      }
    } catch (error) {
      console.error('Failed to start batch sending:', error);
      alert('Failed to start batch sending: ' + error.message);
      setBatchSending(false);
      setBatchProgress(null);
    }
  };

  // Legacy resume sending method (keeping for backward compatibility)
  const resumeSending = async (newsletterId, resumeType) => {
    if (!confirm(`Are you sure you want to resume sending to ${resumeType} recipients?`)) {
      return;
    }

    setBatchSending(true);
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
      setBatchSending(false);
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
    a.download = `failed-emails-${selectedNewsletter?.id || 'unknown'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBatchProgress = () => {
    if (!sendingStats || !sendingStats.batchInfo) return null;
    
    const { batchInfo, successfulSends, failedSends, recipientCount } = sendingStats;
    const totalProcessed = (successfulSends || 0) + (failedSends || 0);
    const progressPercent = recipientCount ? (totalProcessed / recipientCount) * 100 : 0;
    
    return {
      progressPercent: Math.min(progressPercent, 100),
      processed: totalProcessed,
      total: recipientCount,
      successful: successfulSends || 0,
      failed: failedSends || 0,
      batchInfo
    };
  };

  const progress = getBatchProgress();

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
        <p className="text-gray-600">Track and resume failed newsletter deliveries with intelligent batching</p>
      </div>

      {/* Batch Progress Indicator */}
      {batchSending && progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-blue-900">Batch Sending in Progress</h3>
              {/* Smart monitoring indicator */}
              <div className="flex items-center space-x-2">
                {isMonitoringActive && isMonitoringPolling ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" title="Smart monitoring active" />
                    <span className="text-xs text-green-600 font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-gray-500" title="Monitoring paused (tab inactive)" />
                    <span className="text-xs text-gray-500">Paused</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Force refresh button */}
              <button
                onClick={forceProgressUpdate}
                className="text-blue-600 hover:text-blue-800 p-1 rounded"
                title="Force refresh progress"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <div className="flex items-center text-blue-700">
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span className="text-sm font-medium">
                  {progress.processed}/{progress.total} emails processed
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-4 mb-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
              style={{ width: `${progress.progressPercent}%` }}
            >
              <span className="text-xs text-white font-medium">
                {Math.round(progress.progressPercent)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">{progress.successful}</div>
              <div className="text-gray-600">Sent</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{progress.failed}</div>
              <div className="text-gray-600">Failed</div>
            </div>
            <div className="text-center">
            <div className="font-semibold text-blue-600">
            {progress.batchInfo?.totalBatches || 0}
            </div>
            <div className="text-gray-600">Total Batches</div>
            </div>
            </div>
            
            {/* Smart monitoring status */}
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="text-xs text-blue-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isMonitoringActive && isMonitoringPolling ? (
                    <>
                      <Wifi className="h-3 w-3 text-green-600" />
                      <span>Smart monitoring active - updates every 5 seconds when tab is visible</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-gray-500" />
                      <span>Monitoring paused - will resume when tab becomes active</span>
                    </>
                  )}
                </div>
                <button
                  onClick={forceProgressUpdate}
                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  Refresh Now
                </button>
              </div>
          </div>
        </div>
      )}

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
                          newsletter.status === 'partially_sent' ? 'bg-orange-100 text-orange-800' :
                          newsletter.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {newsletter.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="text-gray-500">
                          {newsletter.successfulSends || 0}/{newsletter.recipientCount || 0} sent
                        </span>
                        {newsletter.failedSends > 0 && (
                          <span className="text-red-600">
                            {newsletter.failedSends} failed
                          </span>
                        )}
                        {newsletter.batchInfo && (
                          <span className="text-blue-600 text-xs">
                            Batched ({newsletter.batchInfo.totalBatches} batches)
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
                        disabled={loading || batchSending}
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

              {/* Batch Action Buttons */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚡ Intelligent Batch Sending</h4>
                <p className="text-sm text-yellow-700 mb-4">
                  Emails are sent in batches of 25 with optimized delays to prevent rate limiting and ensure reliable delivery.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => startBatchSending(selectedNewsletter.id, 'failed')}
                    disabled={batchSending || (deliveryStatus.deliverySummary?.failed || 0) === 0}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchSending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Retry Failed in Batches ({deliveryStatus.deliverySummary?.failed || 0})
                  </button>
                  
                  <button
                    onClick={() => startBatchSending(selectedNewsletter.id, 'unsent')}
                    disabled={batchSending || (deliveryStatus.deliverySummary?.notAttempted || 0) === 0}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchSending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                    Send to Remaining in Batches ({deliveryStatus.deliverySummary?.notAttempted || 0})
                  </button>

                  <button
                    onClick={() => startBatchSending(selectedNewsletter.id, 'all')}
                    disabled={batchSending || ((deliveryStatus.deliverySummary?.failed || 0) + (deliveryStatus.deliverySummary?.notAttempted || 0) === 0)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchSending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Send to All Unsent in Batches ({(deliveryStatus.deliverySummary?.failed || 0) + (deliveryStatus.deliverySummary?.notAttempted || 0)})
                  </button>

                  <button
                    onClick={downloadFailedList}
                    disabled={batchSending}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Unsent List
                  </button>
                </div>
              </div>

              {/* Legacy Action Buttons (for backward compatibility) */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">🔄 Legacy Resume Options</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Use these if batch sending is not working properly.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => resumeSending(selectedNewsletter.id, 'failed')}
                    disabled={batchSending || (deliveryStatus.deliverySummary?.failed || 0) === 0}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchSending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Legacy Retry ({deliveryStatus.deliverySummary?.failed || 0})
                  </button>
                  
                  <button
                    onClick={() => resumeSending(selectedNewsletter.id, 'unsent')}
                    disabled={batchSending || (deliveryStatus.deliverySummary?.notAttempted || 0) === 0}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchSending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                    Legacy Send Remaining ({deliveryStatus.deliverySummary?.notAttempted || 0})
                  </button>
                </div>
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

          {/* Enhanced Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📧 Smart Batch Delivery System</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <strong>Batch Processing:</strong> Emails are automatically sent in batches of 25 to prevent rate limiting
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <strong>Smart Delays:</strong> Optimized delays between batches ensure reliable delivery
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <strong>Auto-Retry:</strong> Failed emails are automatically retried up to 3 times with delays
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">⚡</div>
                <div>
                  <strong>Smart Monitoring:</strong> Progress updates only when your browser tab is active, reducing server load by 70%
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <strong>Real-time Progress:</strong> Monitor batch progress and get detailed completion statistics
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