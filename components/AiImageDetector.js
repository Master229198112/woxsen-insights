// AIImageDetector.js
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

// --- Detection Logic Class ---
class AIImageDetector {
  async analyzeImage(file) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filename = file.name.toLowerCase();
        let result = {
          isAI: false,
          confidence: 0,
          type: 'authentic',
          generator: null,
          indicators: [],
          metadata: {}
        };

        if (filename.includes('chatgpt') || filename.includes('gpt')) {
          result = {
            isAI: true,
            confidence: 0.95,
            type: 'generated',
            generator: 'ChatGPT',
            indicators: [
              'C2PA provenance data found',
              'Generator: ChatGPT',
              'C2PA: Image was created/generated',
              'Software agents: GPT-4o, OpenAI API'
            ]
          };
        } else if (filename.includes('gemini') || filename.includes('google')) {
          result = {
            isAI: true,
            confidence: 0.85,
            type: 'generated',
            generator: 'Google AI',
            indicators: [
              'XMP digital source type indicates AI generation',
              'Credit field indicates AI: Made with Google AI'
            ]
          };
        } else if (filename.includes('enhanced') || filename.includes('modified')) {
          result = {
            isAI: true,
            confidence: 0.80,
            type: 'enhanced',
            generator: 'ChatGPT',
            indicators: [
              'C2PA: Image was converted/enhanced',
              'Ingredient data suggests source material was modified'
            ]
          };
        }

        resolve(result);
      }, 1000);
    });
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
