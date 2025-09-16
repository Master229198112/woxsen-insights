// ============================================
// AI-Aware Content Renderer Component
// Save as: components/AIContentRenderer.jsx
// ============================================

'use client';
import { useEffect, useRef } from 'react';
import { useAIImageDetector } from './AiImageDetector';

const AIContentRenderer = ({ content, className = "" }) => {
  const contentRef = useRef(null);
  const { analyze } = useAIImageDetector();
  
  useEffect(() => {
    if (!contentRef.current) return;
    
    const analyzeContentImages = async () => {
      const images = contentRef.current.querySelectorAll('img');
      
      for (const img of images) {
        // Skip if already analyzed
        if (img.dataset.aiAnalyzed) continue;
        
        try {
          // Mark as being analyzed
          img.dataset.aiAnalyzed = 'processing';
          
          // Create a fake file for AI analysis
          const response = await fetch(img.src);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: blob.type });
          
          // Analyze the image
          const analysis = await analyze(file);
          
          // Mark as analyzed and store results
          img.dataset.aiAnalyzed = 'completed';
          
          if (analysis && analysis.isAI) {
            img.dataset.aiDetected = 'true';
            img.dataset.aiConfidence = Math.round(analysis.confidence * 100);
            img.dataset.aiType = analysis.type;
            
            // Add AI label overlay
            addAILabel(img, analysis);
          }
          
        } catch (error) {
          console.error('Error analyzing content image:', error);
          img.dataset.aiAnalyzed = 'error';
        }
      }
    };
    
    // Run analysis after content loads
    const timer = setTimeout(analyzeContentImages, 2000);
    return () => clearTimeout(timer);
    
  }, [content, analyze]);
  
  const addAILabel = (img, analysis) => {
    // Remove existing label if any
    const existingLabel = img.parentElement.querySelector('.ai-detection-label');
    if (existingLabel) existingLabel.remove();
    
    // Create wrapper if image isn't wrapped
    let wrapper = img.parentElement;
    if (!wrapper.classList.contains('image-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'image-wrapper';
      wrapper.style.cssText = 'position: relative; display: inline-block;';
      img.parentElement.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    }
    
    // Create label container
    const labelContainer = document.createElement('div');
    labelContainer.className = 'ai-detection-label';
    labelContainer.style.cssText = `
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(239, 68, 68, 0.95);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10;
      pointer-events: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    
    // Create label content
    labelContainer.innerHTML = `⚠️ Source: AI Generated Image`;
    
    // Add label to wrapper
    wrapper.appendChild(labelContainer);
  };
  
  return (
    <div 
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default AIContentRenderer;