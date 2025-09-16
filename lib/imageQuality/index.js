// Image Quality Analysis Library
// Re-exports for easy importing

export { ImageQualityAnalyzer } from '../imageQuality.js';
export * from './utils.js';

// Main analyzer instance
import { ImageQualityAnalyzer } from '../imageQuality.js';
export const imageQualityAnalyzer = new ImageQualityAnalyzer();

// Quick analysis function
export const analyzeImage = async (file) => {
  const analyzer = new ImageQualityAnalyzer();
  return await analyzer.analyzeImageQuality(file);
};

// Quality check function
export const checkImageQuality = async (file) => {
  const analysis = await analyzeImage(file);
  const analyzer = new ImageQualityAnalyzer();
  
  return {
    analysis,
    meetsStandards: analyzer.meetsMinimumQuality(analysis),
    recommendations: analysis.recommendations || []
  };
};