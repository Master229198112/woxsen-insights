// Enhanced AI Image Detector with metadata analysis
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Eye, Zap } from 'lucide-react';

// --- Enhanced Detection Logic Class ---
class AIImageDetector {
  constructor() {
    // AI generation indicators in metadata
    this.aiIndicators = {
      // Software signatures
      software: [
        'midjourney', 'dall-e', 'dalle', 'chatgpt', 'gpt', 'stable diffusion', 'stablediffusion',
        'adobe firefly', 'firefly', 'canva', 'ai', 'artificial intelligence',
        'generated', 'created by ai', 'ai-generated', 'synthetic',
        'deepdream', 'gan', 'diffusion', 'neural', 'machine learning',
        'openai', 'anthropic', 'claude', 'gemini', 'bard',
        'runway', 'artbreeder', 'nightcafe', 'craiyon', 'imagen',
        'flux', 'comfyui', 'automatic1111', 'invoke ai'
      ],
      
      // File metadata fields that might indicate AI
      metadataFields: [
        'ai', 'artificial', 'generated', 'synthetic', 'neural', 'diffusion',
        'prompt', 'seed', 'steps', 'sampler', 'cfg', 'guidance',
        'model', 'checkpoint', 'lora', 'embedding'
      ],
      
      // Suspicious file patterns
      filePatterns: [
        /^img_\d{8}_\d{6}\.png$/i, // Common AI naming pattern
        /^image_\d+\.png$/i,
        /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/i,
        /^generated_\d+/i,
        /^ai_/i,
        /^dalle_/i,
        /^midjourney_/i,
        /^sd_/i, // Stable Diffusion
        /^comfy_/i // ComfyUI
      ]
    };
  }

  async analyzeImage(file) {
    try {
      const results = await Promise.all([
        this.analyzeFilename(file),
        this.analyzeExifData(file),
        this.analyzeFileProperties(file),
        this.analyzeBinarySignatures(file)
      ]);

      return this.combineResults(results, file);
    } catch (error) {
      console.error('AI detection error:', error);
      return {
        isAI: false,
        confidence: 0,
        type: 'authentic',
        generator: null,
        indicators: [],
        metadata: {},
        error: 'Analysis failed'
      };
    }
  }

  // 1. Enhanced filename analysis
  analyzeFilename(file) {
    const filename = file.name.toLowerCase();
    const indicators = [];
    let confidence = 0;
    let suspiciousPatterns = 0;

    // Check for AI software names
    for (const indicator of this.aiIndicators.software) {
      if (filename.includes(indicator)) {
        indicators.push(`Filename contains: "${indicator}"`);
        confidence += indicator.length > 3 ? 0.4 : 0.2; // Longer terms are more specific
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.aiIndicators.filePatterns) {
      if (pattern.test(filename)) {
        indicators.push(`Filename matches AI generation pattern`);
        suspiciousPatterns++;
        confidence += 0.3;
      }
    }

    return {
      source: 'filename',
      confidence: Math.min(confidence, 0.9), // Cap at 90%
      indicators,
      details: { suspiciousPatterns, filename }
    };
  }

  // 2. EXIF and metadata analysis
  async analyzeExifData(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          const view = new DataView(buffer);
          const indicators = [];
          let confidence = 0;
          
          // Check for EXIF data presence
          if (this.hasExifData(view)) {
            const exifData = this.extractExifStrings(buffer);
            
            // Analyze EXIF strings for AI indicators
            for (const [key, value] of Object.entries(exifData)) {
              const lowercaseValue = value.toLowerCase();
              
              for (const indicator of this.aiIndicators.software) {
                if (lowercaseValue.includes(indicator)) {
                  indicators.push(`EXIF ${key}: Contains "${indicator}"`);
                  confidence += 0.5;
                }
              }

              for (const field of this.aiIndicators.metadataFields) {
                if (lowercaseValue.includes(field)) {
                  indicators.push(`EXIF ${key}: Contains AI-related term "${field}"`);
                  confidence += 0.3;
                }
              }
            }

            // Check for suspicious metadata patterns
            if (exifData.Software && !exifData.Camera && !exifData.Make) {
              indicators.push('Software metadata present but no camera info');
              confidence += 0.2;
            }

            // Check for common AI generation metadata
            if (exifData.Comment && 
                (exifData.Comment.includes('steps') || 
                 exifData.Comment.includes('seed') || 
                 exifData.Comment.includes('prompt'))) {
              indicators.push('AI generation parameters found in comments');
              confidence += 0.7;
            }
          } else {
            // Suspicious: No EXIF data in a modern image file
            if (file.type === 'image/png' && file.size > 100000) {
              indicators.push('Large PNG with no metadata (suspicious)');
              confidence += 0.1;
            }
          }

          resolve({
            source: 'exif',
            confidence: Math.min(confidence, 0.9),
            indicators,
            details: { hasExif: this.hasExifData(view), exifData }
          });
        } catch (error) {
          resolve({
            source: 'exif',
            confidence: 0,
            indicators: [],
            details: { error: error.message }
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          source: 'exif',
          confidence: 0,
          indicators: [],
          details: { error: 'Failed to read file' }
        });
      };
      
      reader.readAsArrayBuffer(file.slice(0, 65536)); // Read first 64KB for metadata
    });
  }

  // 3. File properties analysis
  analyzeFileProperties(file) {
    const indicators = [];
    let confidence = 0;

    // Check file size patterns (AI images often have specific size ranges)
    const sizeMB = file.size / (1024 * 1024);
    
    // Very large PNG files are often AI generated
    if (file.type === 'image/png' && sizeMB > 5) {
      indicators.push('Very large PNG file size (common in AI generation)');
      confidence += 0.2;
    }
    
    // Very small files with high resolution might be over-compressed AI images
    if (sizeMB < 0.5) {
      indicators.push('Very small file size (may indicate AI compression)');
      confidence += 0.1;
    }

    // Check creation/modification time patterns
    const now = Date.now();
    const fileTime = file.lastModified;
    const hoursSinceModified = (now - fileTime) / (1000 * 60 * 60);
    
    if (hoursSinceModified < 1) {
      indicators.push('Very recently created/modified file');
      confidence += 0.1;
    }

    return Promise.resolve({
      source: 'properties',
      confidence: Math.min(confidence, 0.3), // Properties alone shouldn't be too decisive
      indicators,
      details: { 
        size: file.size, 
        type: file.type, 
        lastModified: file.lastModified,
        sizeMB: sizeMB.toFixed(2)
      }
    });
  }

  // 4. Binary signature analysis
  async analyzeBinarySignatures(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target.result;
        const view = new Uint8Array(buffer);
        const indicators = [];
        let confidence = 0;

        // Convert first 1024 bytes to string for pattern matching
        const headerStr = Array.from(view.slice(0, 1024))
          .map(byte => String.fromCharCode(byte))
          .join('')
          .toLowerCase();

        // Check for AI-related strings in binary data
        const aiStrings = [
          'midjourney', 'dall-e', 'stable diffusion', 'openai', 
          'generated', 'artificial', 'neural', 'diffusion'
        ];

        for (const str of aiStrings) {
          if (headerStr.includes(str)) {
            indicators.push(`Binary data contains: "${str}"`);
            confidence += 0.4;
          }
        }

        // Check for unusual PNG chunks that might indicate AI generation
        if (file.type === 'image/png') {
          const pngAnalysis = this.analyzePngChunks(view);
          if (pngAnalysis.suspicious) {
            indicators.push(...pngAnalysis.indicators);
            confidence += pngAnalysis.confidence;
          }
        }

        resolve({
          source: 'binary',
          confidence: Math.min(confidence, 0.8),
          indicators,
          details: { headerLength: buffer.byteLength }
        });
      };

      reader.onerror = () => {
        resolve({
          source: 'binary',
          confidence: 0,
          indicators: [],
          details: { error: 'Failed to read binary data' }
        });
      };

      reader.readAsArrayBuffer(file.slice(0, 2048)); // Read first 2KB
    });
  }

  // Helper methods
  hasExifData(view) {
    // Check for EXIF markers
    return (view.getUint16(0) === 0xFFD8 && // JPEG marker
            view.byteLength > 10) ||
           (view.getUint32(0) === 0x89504E47); // PNG marker
  }

  extractExifStrings(buffer) {
    const view = new Uint8Array(buffer);
    const strings = {};
    let currentString = '';
    let isReadingString = false;
    
    // Simple string extraction from binary data
    for (let i = 0; i < Math.min(view.length, 2048); i++) {
      const char = view[i];
      
      if (char >= 32 && char <= 126) { // Printable ASCII
        currentString += String.fromCharCode(char);
        isReadingString = true;
      } else if (isReadingString && currentString.length > 3) {
        // Found end of string, categorize it
        if (currentString.toLowerCase().includes('software')) strings.Software = currentString;
        else if (currentString.toLowerCase().includes('camera')) strings.Camera = currentString;
        else if (currentString.toLowerCase().includes('make')) strings.Make = currentString;
        else if (currentString.toLowerCase().includes('comment')) strings.Comment = currentString;
        else if (currentString.length > 5) strings[`Unknown_${Object.keys(strings).length}`] = currentString;
        
        currentString = '';
        isReadingString = false;
      } else {
        currentString = '';
        isReadingString = false;
      }
    }
    
    return strings;
  }

  analyzePngChunks(view) {
    // PNG chunk analysis for AI detection
    const indicators = [];
    let confidence = 0;
    
    // Look for unusual chunk types that might indicate AI processing
    const chunkTypes = [];
    for (let i = 8; i < Math.min(view.length - 8, 1024); i += 4) {
      const chunkType = String.fromCharCode(view[i], view[i+1], view[i+2], view[i+3]);
      if (/^[A-Za-z]{4}$/.test(chunkType)) {
        chunkTypes.push(chunkType);
      }
    }
    
    // Check for non-standard chunks
    const standardChunks = ['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM'];
    const nonStandardChunks = chunkTypes.filter(chunk => !standardChunks.includes(chunk));
    
    if (nonStandardChunks.length > 2) {
      indicators.push('Multiple non-standard PNG chunks detected');
      confidence += 0.2;
    }
    
    return {
      suspicious: indicators.length > 0,
      indicators,
      confidence,
      chunkTypes
    };
  }

  // Combine all analysis results
  combineResults(results, file) {
    const allIndicators = [];
    let totalConfidence = 0;
    let maxConfidence = 0;
    let detectedGenerator = null;
    const metadata = {};

    // Collect all indicators and calculate confidence
    for (const result of results) {
      if (result.indicators) {
        allIndicators.push(...result.indicators);
      }
      
      totalConfidence += result.confidence || 0;
      maxConfidence = Math.max(maxConfidence, result.confidence || 0);
      
      if (result.details) {
        metadata[result.source] = result.details;
      }
    }

    // Weight the confidence (some sources are more reliable)
    const weightedConfidence = Math.min(
      totalConfidence * 0.7 + maxConfidence * 0.3, 
      0.95
    ); // Cap at 95%

    // Determine generator based on indicators
    const indicatorText = allIndicators.join(' ').toLowerCase();
    if (indicatorText.includes('chatgpt') || indicatorText.includes('gpt')) {
      detectedGenerator = 'ChatGPT';
    } else if (indicatorText.includes('midjourney')) {
      detectedGenerator = 'Midjourney';
    } else if (indicatorText.includes('dall-e') || indicatorText.includes('dalle')) {
      detectedGenerator = 'DALL-E';
    } else if (indicatorText.includes('stable diffusion') || indicatorText.includes('stablediffusion')) {
      detectedGenerator = 'Stable Diffusion';
    } else if (indicatorText.includes('gemini') || indicatorText.includes('bard')) {
      detectedGenerator = 'Google AI';
    } else if (indicatorText.includes('firefly')) {
      detectedGenerator = 'Adobe Firefly';
    } else if (weightedConfidence > 0.5) {
      detectedGenerator = 'Unknown AI';
    }

    // Determine type and final classification
    let type = 'authentic';
    let isAI = false;

    if (weightedConfidence > 0.7) {
      type = 'generated';
      isAI = true;
    } else if (weightedConfidence > 0.4) {
      type = 'enhanced';
      isAI = true;
    } else if (weightedConfidence > 0.2) {
      type = 'suspicious';
      isAI = false; // Not confident enough to mark as AI
    }

    return {
      isAI,
      confidence: weightedConfidence,
      type,
      generator: detectedGenerator,
      indicators: allIndicators,
      metadata,
      analysis: {
        totalSources: results.length,
        confidenceBreakdown: results.map(r => ({ 
          source: r.source, 
          confidence: r.confidence 
        }))
      }
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
    console.log('🔍 Starting comprehensive AI image analysis for:', file.name);
    
    try {
      const result = await detector.analyzeImage(file);
      console.log('✅ AI Analysis complete:', result);
      setAnalysis(result);
      return result;
    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      const errorResult = { 
        error: 'Failed to analyze image', 
        isAI: false, 
        confidence: 0,
        type: 'authentic',
        generator: null,
        indicators: [`Analysis error: ${error.message}`],
        metadata: {}
      };
      setAnalysis(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, analyze };
}

// --- Enhanced Result Renderer ---
export function AIImageDetectionResults({ analysis }) {
  if (!analysis) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-red-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    if (confidence >= 0.2) return 'text-orange-600';
    return 'text-green-600';
  };

  const getTypeIcon = (type, isAI) => {
    if (isAI) {
      switch (type) {
        case 'generated': return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'enhanced': return <Zap className="w-5 h-5 text-yellow-500" />;
        default: return <AlertTriangle className="w-5 h-5 text-red-500" />;
      }
    } else {
      switch (type) {
        case 'suspicious': return <Eye className="w-5 h-5 text-orange-500" />;
        default: return <CheckCircle className="w-5 h-5 text-green-500" />;
      }
    }
  };

  const getTypeColor = (type, isAI) => {
    if (isAI) {
      return type === 'generated' ? 'border-red-200' : 'border-yellow-200';
    }
    return type === 'suspicious' ? 'border-orange-200' : 'border-green-200';
  };

  return (
    <div className={`bg-gray-50 border-2 ${getTypeColor(analysis.type, analysis.isAI)} rounded-lg p-4 mt-4`}>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
        {getTypeIcon(analysis.type, analysis.isAI)} Detection Results
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

      {/* Detection Details */}
      {analysis.indicators && analysis.indicators.length > 0 && (
        <div className="mb-4">
          <p className="font-medium text-gray-700 mb-2">Detection Indicators:</p>
          <ul className="text-sm space-y-1">
            {analysis.indicators.slice(0, 5).map((indicator, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span className="text-gray-600">{indicator}</span>
              </li>
            ))}
            {analysis.indicators.length > 5 && (
              <li className="text-sm text-gray-500 italic">
                ... and {analysis.indicators.length - 5} more indicators
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Analysis Breakdown */}
      {analysis.analysis && (
        <div className="text-xs text-gray-500 border-t pt-2">
          <p>Analysis sources: {analysis.analysis.totalSources} • 
             Confidence breakdown: {analysis.analysis.confidenceBreakdown
               .map(s => `${s.source}: ${(s.confidence * 100).toFixed(0)}%`)
               .join(', ')}</p>
        </div>
      )}

      {/* Error Display */}
      {analysis.error && (
        <div className="text-sm text-red-600 mt-2">
          ⚠️ {analysis.error}
        </div>
      )}

      {/* Quality Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
        <p className="text-blue-800 text-sm font-medium mb-1">Supported Image Sources:</p>
        <div className="text-blue-700 text-xs">
          <p><strong>Upload:</strong> JPG, PNG, WEBP (max 5MB)</p>
          <p><strong>External URLs from:</strong> Imgur, Pexels, GitHub, University domains, Cloudinary</p>
          <p><strong>AI Detection:</strong> Analyzes filename, EXIF data, file properties, and binary signatures</p>
        </div>
      </div>
    </div>
  );
}
