'use client';
import SmartImage from './SmartImage';
import AIImageLabel from '@/components/AIImageLabel';

const SmartImageWithAI = ({ 
  src, 
  alt, 
  imageAnalysis = null,
  showAILabel = true,
  aiLabelPosition = 'bottom-left',
  aiLabelSize = 'default',
  className = '',
  ...props 
}) => {
  const getPositionClasses = (position) => {
    switch (position) {
      case 'top-left':
        return 'absolute top-2 left-2';
      case 'top-right':
        return 'absolute top-2 right-2';
      case 'bottom-left':
        return 'absolute bottom-2 left-2';
      case 'bottom-right':
        return 'absolute bottom-2 right-2';
      case 'below':
        return 'mt-2';
      default:
        return 'absolute bottom-2 left-2';
    }
  };

  if (aiLabelPosition === 'below') {
    return (
      <div className={className}>
        <SmartImage 
          src={src} 
          alt={alt} 
          {...props}
        />
        {showAILabel && imageAnalysis && imageAnalysis.isAI && (
          <div className={getPositionClasses('below')}>
            <AIImageLabel 
              imageAnalysis={imageAnalysis}
              size={aiLabelSize}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <SmartImage 
        src={src} 
        alt={alt} 
        {...props}
      />
      {showAILabel && imageAnalysis && imageAnalysis.isAI && (
        <div className={getPositionClasses(aiLabelPosition)}>
          <AIImageLabel 
            imageAnalysis={imageAnalysis}
            size={aiLabelSize}
            className="shadow-sm"
          />
        </div>
      )}
    </div>
  );
};

export default SmartImageWithAI;