// ========================================
// 📁 lib/imageQuality.js - Image Quality Analysis Utilities
// ========================================

/**
 * Analyzes image quality including blur detection, resolution, and overall quality
 */
export class ImageQualityAnalyzer {
  constructor() {
    this.minWidth = 400;
    this.minHeight = 300;
    this.minBlurScore = 100; // Laplacian variance threshold
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.minFileSize = 50 * 1024; // 50KB (too small likely means low quality)
  }

  /**
   * Analyzes image quality from a File object
   * @param {File} file - The image file to analyze
   * @returns {Promise<Object>} Quality analysis results
   */
  async analyzeImageQuality(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        try {
          // Get image data
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          
          // Perform quality analysis
          const analysis = {
            width: img.width,
            height: img.height,
            fileSize: file.size,
            fileName: file.name,
            resolution: this.analyzeResolution(img.width, img.height),
            blur: this.detectBlur(imageData),
            compression: this.analyzeCompression(file.size, img.width, img.height),
            overall: 'good'
          };
          
          // Determine overall quality
          analysis.overall = this.determineOverallQuality(analysis);
          
          // Generate recommendations
          analysis.recommendations = this.generateRecommendations(analysis);
          
          resolve(analysis);
        } catch (error) {
          console.error('Error analyzing image:', error);
          resolve({
            width: img.width,
            height: img.height,
            fileSize: file.size,
            fileName: file.name,
            resolution: { quality: 'unknown', score: 0 },
            blur: { isBlurry: false, score: 0 },
            compression: { quality: 'unknown', score: 0 },
            overall: 'unknown',
            recommendations: ['Unable to analyze image quality. Please ensure the image is valid.']
          });
        }
      };
      
      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          fileSize: file.size,
          fileName: file.name,
          resolution: { quality: 'invalid', score: 0 },
          blur: { isBlurry: true, score: 0 },
          compression: { quality: 'invalid', score: 0 },
          overall: 'poor',
          recommendations: ['Invalid image file. Please upload a valid image.']
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Analyzes image resolution quality
   */
  analyzeResolution(width, height) {
    const totalPixels = width * height;
    const aspectRatio = width / height;
    
    let quality = 'poor';
    let score = 0;
    
    if (width >= 1920 && height >= 1080) {
      quality = 'excellent';
      score = 100;
    } else if (width >= 1280 && height >= 720) {
      quality = 'good';
      score = 80;
    } else if (width >= 800 && height >= 600) {
      quality = 'fair';
      score = 60;
    } else if (width >= this.minWidth && height >= this.minHeight) {
      quality = 'acceptable';
      score = 40;
    } else {
      quality = 'poor';
      score = 20;
    }
    
    return {
      quality,
      score,
      width,
      height,
      totalPixels,
      aspectRatio: Math.round(aspectRatio * 100) / 100,
      megapixels: Math.round(totalPixels / 1000000 * 10) / 10
    };
  }

  /**
   * Detects image blur using Laplacian variance
   */
  detectBlur(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Convert to grayscale and apply Laplacian filter
    let variance = 0;
    let mean = 0;
    let count = 0;
    
    // Sample every 4th pixel for performance (can adjust for accuracy)
    const step = 4;
    
    for (let y = 1; y < height - 1; y += step) {
      for (let x = 1; x < width - 1; x += step) {
        const idx = (y * width + x) * 4;
        
        // Convert to grayscale
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // Apply simplified Laplacian filter
        const laplacian = Math.abs(
          -4 * gray +
          data[((y-1) * width + x) * 4] + // top
          data[((y+1) * width + x) * 4] + // bottom  
          data[(y * width + (x-1)) * 4] + // left
          data[(y * width + (x+1)) * 4]   // right
        );
        
        mean += laplacian;
        count++;
      }
    }
    
    mean = mean / count;
    
    // Calculate variance
    count = 0;
    for (let y = 1; y < height - 1; y += step) {
      for (let x = 1; x < width - 1; x += step) {
        const idx = (y * width + x) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        const laplacian = Math.abs(
          -4 * gray +
          data[((y-1) * width + x) * 4] +
          data[((y+1) * width + x) * 4] + 
          data[(y * width + (x-1)) * 4] +
          data[(y * width + (x+1)) * 4]
        );
        
        variance += Math.pow(laplacian - mean, 2);
        count++;
      }
    }
    
    variance = variance / count;
    const score = Math.round(variance);
    
    let quality = 'good';
    let isBlurry = false;
    
    if (score < 50) {
      quality = 'very blurry';
      isBlurry = true;
    } else if (score < 100) {
      quality = 'blurry';
      isBlurry = true;
    } else if (score < 200) {
      quality = 'slightly soft';
      isBlurry = false;
    } else if (score < 500) {
      quality = 'sharp';
      isBlurry = false;
    } else {
      quality = 'very sharp';
      isBlurry = false;
    }
    
    return {
      isBlurry,
      score,
      quality,
      threshold: this.minBlurScore
    };
  }

  /**
   * Analyzes compression quality based on file size vs dimensions
   */
  analyzeCompression(fileSize, width, height) {
    const totalPixels = width * height;
    const bytesPerPixel = fileSize / totalPixels;
    
    let quality = 'good';
    let score = 70;
    
    if (bytesPerPixel < 0.1) {
      quality = 'heavily compressed';
      score = 20;
    } else if (bytesPerPixel < 0.5) {
      quality = 'compressed';
      score = 40;
    } else if (bytesPerPixel < 1.0) {
      quality = 'lightly compressed';
      score = 60;
    } else if (bytesPerPixel < 2.0) {
      quality = 'good';
      score = 80;
    } else {
      quality = 'excellent';
      score = 100;
    }
    
    return {
      quality,
      score,
      bytesPerPixel: Math.round(bytesPerPixel * 1000) / 1000,
      fileSize,
      totalPixels
    };
  }

  /**
   * Determines overall image quality
   */
  determineOverallQuality(analysis) {
    const weights = {
      resolution: 0.4,
      blur: 0.4,
      compression: 0.2
    };
    
    const scores = {
      resolution: analysis.resolution.score,
      blur: analysis.blur.isBlurry ? 0 : Math.min(analysis.blur.score / 5, 100),
      compression: analysis.compression.score
    };
    
    const weightedScore = 
      scores.resolution * weights.resolution +
      scores.blur * weights.blur +
      scores.compression * weights.compression;
    
    if (weightedScore >= 80) return 'excellent';
    if (weightedScore >= 65) return 'good';
    if (weightedScore >= 45) return 'fair';
    if (weightedScore >= 25) return 'poor';
    return 'very poor';
  }

  /**
   * Generates recommendations for image improvement
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Resolution recommendations
    if (analysis.resolution.score < 60) {
      if (analysis.width < this.minWidth || analysis.height < this.minHeight) {
        recommendations.push(`Image resolution is too low (${analysis.width}×${analysis.height}). Please upload an image at least ${this.minWidth}×${this.minHeight} pixels.`);
      } else {
        recommendations.push('Consider using a higher resolution image for better quality.');
      }
    }
    
    // Blur recommendations
    if (analysis.blur.isBlurry) {
      if (analysis.blur.score < 50) {
        recommendations.push('Image appears very blurry. Please upload a sharper image.');
      } else {
        recommendations.push('Image appears slightly blurry. Consider using a sharper image for better quality.');
      }
    }
    
    // Compression recommendations
    if (analysis.compression.score < 40) {
      recommendations.push('Image appears heavily compressed. Try uploading a less compressed version.');
    }
    
    // File size recommendations
    if (analysis.fileSize < this.minFileSize) {
      recommendations.push('File size is very small, which may indicate poor quality. Consider uploading a larger, higher quality image.');
    }
    
    // Overall recommendations
    if (analysis.overall === 'poor' || analysis.overall === 'very poor') {
      recommendations.push('Overall image quality is low. For best results, please upload a high-resolution, sharp, and minimally compressed image.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Image quality looks good!');
    }
    
    return recommendations;
  }

  /**
   * Quick quality check - returns true if image meets minimum standards
   */
  meetsMinimumQuality(analysis) {
    return analysis.overall !== 'poor' && 
           analysis.overall !== 'very poor' && 
           !analysis.blur.isBlurry &&
           analysis.resolution.score >= 40;
  }
}

export default ImageQualityAnalyzer;
