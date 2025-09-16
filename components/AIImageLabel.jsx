'use client';
import { AlertTriangle, Zap, Eye } from 'lucide-react';

const AIImageLabel = ({ imageAnalysis, className = '', size = 'default' }) => {
  // Don't render if no analysis data or not AI generated/enhanced
  if (!imageAnalysis || !imageAnalysis.isAI) {
    return null;
  }

  const getLabelText = (type, generator) => {
    let baseText = '';
    
    switch (type) {
      case 'generated':
        baseText = 'AI Generated Image';
        break;
      case 'enhanced':
        baseText = 'AI Enhanced Image';
        break;
      default:
        baseText = 'AI Generated/Enhanced Image';
    }
    
    if (generator) {
      baseText += ` (${generator})`;
    }
    
    return `Source: ${baseText}`;
  };

  const getIcon = (type, confidence) => {
    if (confidence >= 0.8) {
      return <AlertTriangle className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />;
    } else if (type === 'enhanced') {
      return <Zap className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />;
    } else {
      return <Eye className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />;
    }
  };

  const getColors = (type, confidence) => {
    if (confidence >= 0.8) {
      return {
        background: 'bg-red-100',
        border: 'border-red-300',
        text: 'text-red-800',
        icon: 'text-red-600'
      };
    } else if (confidence >= 0.4 || type === 'enhanced') {
      return {
        background: 'bg-yellow-100',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        icon: 'text-yellow-600'
      };
    } else {
      return {
        background: 'bg-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-800',
        icon: 'text-orange-600'
      };
    }
  };

  const colors = getColors(imageAnalysis.type, imageAnalysis.confidence);
  const labelText = getLabelText(imageAnalysis.type, imageAnalysis.generator);
  const icon = getIcon(imageAnalysis.type, imageAnalysis.confidence);

  const baseClasses = `
    inline-flex items-center px-2 py-1 rounded-md border font-medium
    ${colors.background} ${colors.border} ${colors.text}
    ${size === 'small' ? 'text-xs' : 'text-sm'}
    ${className}
  `;

  return (
    <div className={baseClasses} title={`Confidence: ${(imageAnalysis.confidence * 100).toFixed(1)}%`}>
      <span className={colors.icon}>
        {icon}
      </span>
      {labelText}
    </div>
  );
};

export default AIImageLabel;