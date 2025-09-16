// AI Image Detector for Next.js - Client-side API caller
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

// --- Detection Logic Class ---
class AIImageDetector {
  async analyzeImage(file) {
    try {
      // Create FormData for server-side processing
      const formData = new FormData();
      formData.append('image', file);

      // Send to server-side API endpoint
      const response = await fetch('/api/ai-image-detection', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const analysis = await response.json();

      // Ensure consistent structure
      return {
        isAI: analysis.isAI || false,
        confidence: analysis.confidence || 0,
        type: analysis.type || 'unknown',
        generator: analysis.generator || null,
        indicators: analysis.indicators || [],
        detectedFields: analysis.detectedFields || {},
        rawMetadata: analysis.rawMetadata || {},
        fileInfo: analysis.fileInfo || {},
        error: analysis.error || null
      };

    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        isAI: false,
        confidence: 0,
        type: 'unknown',
        generator: null,
        indicators: [`Error analyzing image: ${error.message}`],
        detectedFields: {},
        rawMetadata: {},
        error: error.message
      };
    }
  }

  // Get a clean summary of detected AI indicators
  getSummary(analysis) {
    return {
      isAI: analysis.isAI,
      confidence: `${(analysis.confidence * 100).toFixed(1)}%`,
      type: analysis.type,
      generator: analysis.generator,
      indicatorCount: analysis.indicators?.length || 0,
      keyFields: Object.keys(analysis.detectedFields || {})
    };
  }
}

// --- Hook to use inside imageUploader ---
export function useAIImageDetector() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const detector = new AIImageDetector();

  const analyze = async (file) => {
    if (!file) return null;
    setLoading(true);
    try {
      const result = await detector.analyzeImage(file);
      setAnalysis(result);
      return result;
    } catch (err) {
      const errorResult = { error: 'Failed to analyze image', isAI: false, confidence: 0 };
      setAnalysis(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, analyze };
}

// --- Small Result Renderer ---
export function AIImageDetectionResults({ analysis }) {
  if (!analysis) return null;

  const getConfidenceColor = (c) => {
    if (c >= 0.8) return 'text-red-600';
    if (c >= 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'generated': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'enhanced': return <Info className="w-5 h-5 text-yellow-500" />;
      case 'authentic': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
        {getTypeIcon(analysis.type)} Detection Results
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium text-gray-700">AI Detection</p>
          <p className={`${analysis.isAI ? 'text-red-600' : 'text-green-600'} font-semibold`}>
            {analysis.isAI ? 'AI Generated/Enhanced' : 'Appears Authentic'}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Confidence</p>
          <p className={`${getConfidenceColor(analysis.confidence)} font-semibold`}>
            {(analysis.confidence * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Type</p>
          <p className="capitalize font-semibold">{analysis.type}</p>
        </div>
        {analysis.generator && (
          <div>
            <p className="font-medium text-gray-700">Generator</p>
            <p className="font-semibold">{analysis.generator}</p>
          </div>
        )}
      </div>
    </div>
  );
}
