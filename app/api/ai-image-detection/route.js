// AI Image Detection API - Server-side metadata analysis
import { NextRequest, NextResponse } from 'next/server';
import exifr from 'exifr';

class ServerAIImageDetector {
  constructor() {
    this.aiSignatures = {
      // Known AI generators in metadata
      generators: [
        'chatgpt', 'gpt-4', 'gpt-4o', 'openai', 'openai api',
        'gemini', 'google ai', 'bard', 'made with google ai',
        'midjourney', 'dall-e', 'dalle', 'dall·e',
        'stable diffusion', 'firefly', 'adobe firefly',
        'leonardo ai', 'runwayml', 'replicate', 'anthropic',
        'claude', 'stability ai', 'dreamstudio'
      ],

      // Comprehensive AI-related keywords for metadata string search
      aiKeywords: [
        // Generation terms
        'generated', 'generate', 'generating', 'creation', 'created', 'create',
        'artificial', 'synthetic', 'ai-generated', 'ai generated', 'machine learning',
        'neural network', 'deep learning', 'algorithm', 'algorithmic',

        // AI companies and models
        'openai', 'chatgpt', 'gpt-4', 'gpt-4o', 'gpt4', 'dall-e', 'dalle',
        'google ai', 'gemini', 'bard', 'palm', 'lamda',
        'anthropic', 'claude', 'sonnet', 'haiku', 'opus',
        'midjourney', 'stable diffusion', 'stability ai', 'dreamstudio',
        'adobe firefly', 'leonardo ai', 'runway', 'runwayml',
        'replicate', 'hugging face', 'diffusion', 'latent',

        // Enhancement/editing terms
        'enhanced', 'enhance', 'enhancing', 'upscaled', 'upscale', 'upscaling',
        'edited', 'edit', 'editing', 'modified', 'modify', 'processed',
        'filtered', 'filter', 'converted', 'convert', 'transformed',
        'stylized', 'stylize', 'inpainted', 'inpainting', 'outpainting',

        // Technical terms
        'c2pa', 'content credentials', 'provenance', 'trained algorithmic',
        'trainedAlgorithmicMedia', 'algorithmicMedia', 'digitalSourceType',
        'softwareAgent', 'manifest', 'assertion',

        // Specific AI tools and platforms
        'meta ai', 'llama', 'bing create', 'copilot', 'designer',
        'canva ai', 'photoshop ai', 'generative fill', 'generative expand',
        'firefly', 'sensei', 'nightcafe', 'artbreeder', 'deepart',
        'starryai', 'jasper art', 'copy.ai', 'writesonic'
      ],

      // IPTC digital source types that indicate AI
      aiSourceTypes: [
        'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
        'trainedAlgorithmicMedia',
        'algorithmicMedia',
        'trainedAlgorithmicMedia',
        'compositeWithTrainedAlgorithmicMedia'
      ],

      // C2PA action indicators
      c2paGenerationActions: ['c2pa.created', 'c2pa.placed', 'c2pa.generated'],
      c2paEnhancementActions: ['c2pa.converted', 'c2pa.edited', 'c2pa.enhanced', 'c2pa.filtered'],
      c2paAnyAIActions: ['c2pa.created', 'c2pa.placed', 'c2pa.generated', 'c2pa.converted', 'c2pa.edited', 'c2pa.enhanced', 'c2pa.filtered'],

      // Software/tool signatures
      aiSoftware: [
        'gpt-4o', 'gpt-4', 'openai', 'chatgpt',
        'google ai', 'gemini', 'bard',
        'midjourney', 'dall-e', 'stable diffusion',
        'adobe firefly', 'leonardo ai'
      ]
    };
  }

  async analyzeImageBuffer(buffer, fileInfo = {}) {
    try {
      // Use more comprehensive parsing options on server-side
      const metadata = await exifr.parse(buffer, {
        xmp: true,
        icc: true,
        jfif: true,
        ihdr: true,
        exif: true,
        iptc: true,
        tiff: true,
        gps: false,
        interop: true,
        thumbnail: false,
        multiSegment: true,
        mergeOutput: true,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
        sanitize: false,
        chunked: true,
        firstChunkSize: 40960,
        chunkSize: 65536
      });

      const analysis = {
        isAI: false,
        confidence: 0,
        type: 'authentic',
        generator: null,
        indicators: [],
        detectedFields: {},
        rawMetadata: metadata || {}
      };

      if (!metadata) {
        analysis.indicators.push('No metadata found in image');
        return analysis;
      }

      // Analyze different metadata sections
      this.analyzeC2PAData(metadata, analysis);
      this.analyzeXMPData(metadata, analysis);
      this.analyzeEXIFData(metadata, analysis);
      this.analyzeIPTCData(metadata, analysis);
      this.analyzeGeneralFields(metadata, analysis);

      // Final fallback: comprehensive string search through all metadata
      this.analyzeMetadataStringSearch(metadata, analysis);

      // Additional check: analyze filename for AI indicators (but not as primary method)
      this.analyzeFilename(fileInfo, analysis);

      // Set final type if AI detected but type unknown
      if (analysis.isAI && analysis.type === 'authentic') {
        analysis.type = 'generated';
      }

      // SightEngine API - Only call if our local checks didn't find AI (final confirmation)
      if (!analysis.isAI) {
        await this.analyzeSightEngine(buffer, fileInfo, analysis);
        analysis.indicators.push('SightEngine API used for final confirmation (local checks found no AI)');
      } else {
        analysis.indicators.push('SightEngine API skipped (AI already detected by local checks)');
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing image metadata:', error);
      return {
        isAI: false,
        confidence: 0,
        type: 'unknown',
        generator: null,
        indicators: [`Error reading metadata: ${error.message}`],
        error: error.message,
        rawMetadata: {}
      };
    }
  }

  analyzeC2PAData(metadata, analysis) {
    // Check for C2PA manifest presence (multiple indicators)
    const c2paIndicators = [
      metadata.jumd_type && metadata.jumd_type.includes('c2pa'),
      metadata.jumd_label === 'c2pa',
      metadata.c2pa,
      metadata.claim__generator__info_name,
      metadata.ActionsAction !== undefined,
      metadata.ActionsSoftwareAgentName !== undefined,
      metadata.actions_digital_source_type
    ];

    if (c2paIndicators.some(indicator => indicator)) {
      analysis.isAI = true;
      analysis.confidence = Math.max(analysis.confidence, 0.95);
      analysis.indicators.push('C2PA provenance data detected');
      analysis.detectedFields.c2pa = true;

      // Extract generator info from various C2PA fields
      const generatorFields = [
        'claim__generator__info_name',
        'generator_info_name',
        'softwareAgent_name',
        'claim_generator'
      ];

      for (const field of generatorFields) {
        if (metadata[field]) {
          analysis.generator = metadata[field];
          analysis.indicators.push(`C2PA Generator: ${analysis.generator}`);
          analysis.detectedFields.generator = metadata[field];
          break;
        }
      }

      // Check actions to determine generation vs enhancement
      const actionFields = ['ActionsAction', 'actions_action', 'c2pa_actions'];
      let hasGenerationAction = false;
      let hasEnhancementAction = false;

      for (const field of actionFields) {
        if (metadata[field] !== undefined) {
          let actions = [];

          // Handle different action data structures
          if (Array.isArray(metadata[field])) {
            actions = metadata[field];
          } else if (typeof metadata[field] === 'object' && metadata[field] !== null) {
            // Handle object with numeric keys (like your example: 0: "c2pa.created", 1: "c2pa.converted")
            actions = Object.values(metadata[field]);
          } else {
            actions = [metadata[field]];
          }

          analysis.detectedFields[`${field}_raw`] = metadata[field];
          analysis.detectedFields[`${field}_parsed`] = actions;

          for (const action of actions) {
            const actionStr = String(action).trim();

            // Skip empty or invalid actions
            if (!actionStr || actionStr === 'undefined' || actionStr === 'null') continue;

            // Check for any AI-related action first
            if (this.aiSignatures.c2paAnyAIActions.some(aiAction => actionStr.includes(aiAction))) {
              analysis.isAI = true;
              analysis.confidence = Math.max(analysis.confidence, 0.95);
            }

            // Check specific action types
            if (this.aiSignatures.c2paGenerationActions.some(gen => actionStr.includes(gen))) {
              hasGenerationAction = true;
              analysis.indicators.push(`C2PA Action: Image was created (${actionStr})`);
            }

            if (this.aiSignatures.c2paEnhancementActions.some(enh => actionStr.includes(enh))) {
              hasEnhancementAction = true;
              analysis.indicators.push(`C2PA Action: Image was enhanced (${actionStr})`);
            }
          }
        }
      }

      // Determine final type based on detected actions
      if (hasGenerationAction && hasEnhancementAction) {
        analysis.type = 'enhanced'; // Generated then enhanced = enhanced
        analysis.indicators.push('Image was both generated and enhanced by AI');
      } else if (hasGenerationAction) {
        analysis.type = 'generated';
      } else if (hasEnhancementAction) {
        analysis.type = 'enhanced';
      }

      // Check software agents
      const agentFields = ['ActionsSoftwareAgentName', 'softwareAgent', 'claim_softwareAgent'];

      for (const field of agentFields) {
        if (metadata[field] !== undefined) {
          let agents = [];

          // Handle different agent data structures (similar to actions)
          if (Array.isArray(metadata[field])) {
            agents = metadata[field];
          } else if (typeof metadata[field] === 'object' && metadata[field] !== null) {
            // Handle object with numeric keys (like your example: 0: "GPT-4o", 1: "OpenAI API")
            agents = Object.values(metadata[field]);
          } else {
            agents = [metadata[field]];
          }

          // Filter out empty values
          agents = agents.filter(agent => agent && String(agent).trim() !== '');

          if (agents.length > 0) {
            analysis.indicators.push(`C2PA Software Agents: ${agents.join(', ')}`);
            analysis.detectedFields.softwareAgents = agents;

            for (const agent of agents) {
              const agentStr = String(agent);
              if (this.containsAISignature(agentStr)) {
                analysis.isAI = true;
                analysis.confidence = Math.max(analysis.confidence, 0.98);
                analysis.generator = analysis.generator || agentStr;
              }
            }
          }
        }
      }

      // Check digital source type in C2PA
      const sourceFields = ['actions_digital_source_type', 'digitalSourceType', 'digital_source_type'];

      for (const field of sourceFields) {
        if (metadata[field]) {
          if (this.aiSignatures.aiSourceTypes.some(type =>
            metadata[field].includes(type))) {
            analysis.indicators.push('C2PA Digital source indicates AI generation');
            analysis.confidence = Math.max(analysis.confidence, 0.95);
          }
        }
      }
    }
  }

  analyzeXMPData(metadata, analysis) {
    // Check digital source type fields (more comprehensive)
    const sourceFields = [
      'digital_source_type', 'digital_source_file_type', 'DigitalSourceType',
      'xmp_digital_source_type', 'photoshop_digital_source_type'
    ];

    for (const field of sourceFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.aiSignatures.aiSourceTypes.some(type =>
          String(metadata[field]).toLowerCase().includes(type.toLowerCase()))) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.90);
          analysis.indicators.push(`${field}: Indicates AI generation`);
        }
      }
    }

    // Check credit field (multiple variations)
    const creditFields = ['credit', 'Credit', 'xmp_credit', 'iptc_credit', 'dc_rights'];

    for (const field of creditFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.containsAISignature(metadata[field])) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.85);
          analysis.generator = analysis.generator || metadata[field];
          analysis.indicators.push(`${field} field indicates AI: "${metadata[field]}"`);
        }
      }
    }

    // Check XMP toolkit and creator tools
    const toolFields = ['xmp_toolkit', 'xmp_CreatorTool', 'CreatorTool', 'creatortool'];

    for (const field of toolFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.containsAISignature(metadata[field])) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.80);
          analysis.indicators.push(`${field} indicates AI: "${metadata[field]}"`);
        }
      }
    }
  }

  analyzeEXIFData(metadata, analysis) {
    // Check software field (comprehensive)
    const softwareFields = [
      'Software', 'software', 'ProcessingSoftware', 'exif_Software',
      'tiff_Software', 'make_note_software'
    ];

    for (const field of softwareFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.containsAISignature(metadata[field])) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.80);
          analysis.generator = analysis.generator || metadata[field];
          analysis.indicators.push(`${field} indicates AI: "${metadata[field]}"`);
        }
      }
    }

    // Check make/model fields
    const deviceFields = [
      'Make', 'Model', 'CameraModelName', 'exif_Make', 'exif_Model',
      'tiff_Make', 'tiff_Model', 'LensMake', 'LensModel'
    ];

    for (const field of deviceFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.containsAISignature(metadata[field])) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.75);
          analysis.indicators.push(`${field} indicates AI: "${metadata[field]}"`);
        }
      }
    }

    // Check comments and descriptions
    const commentFields = [
      'UserComment', 'ImageDescription', 'exif_UserComment',
      'exif_ImageDescription', 'tiff_ImageDescription'
    ];

    for (const field of commentFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.containsAISignature(metadata[field])) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.70);
          analysis.indicators.push(`${field} indicates AI: "${metadata[field]}"`);
        }
      }
    }
  }

  analyzeIPTCData(metadata, analysis) {
    // Check IPTC source field
    const sourceFields = ['Source', 'iptc_Source', 'iptc_credit'];

    for (const field of sourceFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.containsAISignature(metadata[field])) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.75);
          analysis.indicators.push(`${field} indicates AI: "${metadata[field]}"`);
        }
      }
    }

    // Check IPTC caption/description
    const captionFields = [
      'Caption', 'Caption-Abstract', 'iptc_Caption', 'iptc_Caption-Abstract',
      'description', 'Headline', 'iptc_Headline'
    ];

    for (const field of captionFields) {
      if (metadata[field]) {
        analysis.detectedFields[field] = metadata[field];

        if (this.containsAISignature(metadata[field])) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.65);
          analysis.indicators.push(`${field} indicates AI: "${metadata[field]}"`);
        }
      }
    }
  }

  analyzeGeneralFields(metadata, analysis) {
    // Search through all metadata fields for AI signatures
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' && value.length > 0 && value.length < 500) {
        if (this.containsAISignature(value) && !analysis.detectedFields[key]) {
          analysis.detectedFields[key] = value;
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, 0.60);
          analysis.indicators.push(`Field "${key}" contains AI signature: "${value}"`);
        }
      }
    }
  }

  containsAISignature(text) {
    if (!text || typeof text !== 'string') return false;

    const lowerText = text.toLowerCase();

    // Check for exact generator matches
    for (const generator of this.aiSignatures.generators) {
      if (lowerText.includes(generator)) {
        return true;
      }
    }

    // Check for AI source type URLs
    for (const sourceType of this.aiSignatures.aiSourceTypes) {
      if (lowerText.includes(sourceType.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  // Comprehensive fallback method: convert all metadata to string and search for AI keywords
  analyzeMetadataStringSearch(metadata, analysis) {
    try {
      // Convert all metadata to a searchable string, excluding binary data and very long strings
      const metadataString = this.convertMetadataToSearchableString(metadata);

      if (!metadataString || metadataString.length < 10) {
        return; // Skip if no meaningful text found
      }

      const lowerMetadata = metadataString.toLowerCase();
      const foundKeywords = [];

      // Search for AI-related keywords
      for (const keyword of this.aiSignatures.aiKeywords) {
        if (lowerMetadata.includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
        }
      }

      if (foundKeywords.length > 0) {
        analysis.isAI = true;

        // Set confidence based on number and type of keywords found
        const confidenceBoost = Math.min(foundKeywords.length * 0.1, 0.4); // Max 0.4 boost
        analysis.confidence = Math.max(analysis.confidence, 0.60 + confidenceBoost);

        analysis.indicators.push(`Metadata string search found AI keywords: ${foundKeywords.slice(0, 5).join(', ')}${foundKeywords.length > 5 ? '...' : ''}`);
        analysis.detectedFields.stringSearchKeywords = foundKeywords;
        analysis.detectedFields.metadataSearchString = metadataString.substring(0, 500); // Debug: show first 500 chars

        // Try to determine generator from found keywords
        if (!analysis.generator) {
          const generatorKeywords = foundKeywords.filter(keyword =>
            this.aiSignatures.generators.includes(keyword.toLowerCase())
          );
          if (generatorKeywords.length > 0) {
            analysis.generator = generatorKeywords[0];
          }
        }

        // Try to determine if it's enhanced vs generated
        if (analysis.type === 'authentic') {
          const enhancementKeywords = ['enhanced', 'enhance', 'edited', 'modified', 'converted', 'processed', 'filtered'];
          const generationKeywords = ['generated', 'created', 'artificial', 'synthetic'];

          const hasEnhancementTerms = foundKeywords.some(keyword =>
            enhancementKeywords.includes(keyword.toLowerCase())
          );
          const hasGenerationTerms = foundKeywords.some(keyword =>
            generationKeywords.includes(keyword.toLowerCase())
          );

          if (hasEnhancementTerms && hasGenerationTerms) {
            analysis.type = 'enhanced';
          } else if (hasEnhancementTerms) {
            analysis.type = 'enhanced';
          } else if (hasGenerationTerms) {
            analysis.type = 'generated';
          } else {
            analysis.type = 'generated'; // Default if AI detected
          }
        }
      }

    } catch (error) {
      console.error('Error in metadata string search:', error);
      analysis.indicators.push(`String search error: ${error.message}`);
    }
  }

  // Convert metadata object to searchable string, filtering out binary data
  convertMetadataToSearchableString(obj, depth = 0, maxDepth = 5) {
    if (depth > maxDepth) return '';

    let result = [];

    try {
      for (const [key, value] of Object.entries(obj)) {
        // Skip binary data fields and very long strings
        if (this.isBinaryOrSkippableField(key, value)) {
          continue;
        }

        // Add the key itself
        result.push(key);

        if (typeof value === 'string') {
          // Only include reasonable length strings
          if (value.length > 0 && value.length < 1000) {
            result.push(value);
          }
        } else if (typeof value === 'number') {
          result.push(value.toString());
        } else if (Array.isArray(value)) {
          // Process array elements
          for (const item of value) {
            if (typeof item === 'string' && item.length > 0 && item.length < 500) {
              result.push(item);
            } else if (typeof item === 'number') {
              result.push(item.toString());
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          // Recursively process nested objects
          const nestedString = this.convertMetadataToSearchableString(value, depth + 1, maxDepth);
          if (nestedString) {
            result.push(nestedString);
          }
        }
      }
    } catch (error) {
      console.error('Error converting metadata to string:', error);
    }

    return result.join(' ');
  }

  // Check if a field should be skipped (binary data, too long, etc.)
  isBinaryOrSkippableField(key, value) {
    // Skip obviously binary fields
    const binaryFieldNames = [
      'hash', 'signature', 'thumbnail', 'data', 'pad', 'item0', 'item1', 'item2', 'item3',
      'raw_header', 'c2pa_thumbnail', 'jpeg_data', 'binary', 'bytes'
    ];

    const keyLower = key.toLowerCase();
    if (binaryFieldNames.some(binaryField => keyLower.includes(binaryField))) {
      return true;
    }

    // Skip very long strings (likely binary)
    if (typeof value === 'string' && value.length > 1000) {
      return true;
    }

    // Skip null/undefined
    if (value === null || value === undefined) {
      return true;
    }

    // Skip if it looks like binary data
    if (typeof value === 'string' && /^[0-9A-Fa-f\s]+$/.test(value) && value.length > 50) {
      return true;
    }

    return false;
  }

  // Analyze filename for AI indicators (as additional confirmation, not primary method)
  analyzeFilename(fileInfo, analysis) {
    try {
      const filename = fileInfo.name || '';

      if (!filename || filename.length < 3) {
        return; // Skip if no meaningful filename
      }

      const lowerFilename = filename.toLowerCase();
      const foundKeywords = [];

      // Search for AI-related keywords in filename
      for (const keyword of this.aiSignatures.aiKeywords) {
        if (lowerFilename.includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
        }
      }

      // Check for UUID pattern (very weak signal)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const baseFilename = filename.replace(/\.[^.]+$/, ''); // Remove extension
      const isUuidPattern = uuidPattern.test(baseFilename);

      if (foundKeywords.length > 0) {
        analysis.isAI = true;

        // Lower confidence for filename-only detection (since filenames can be misleading)
        const confidenceBoost = Math.min(foundKeywords.length * 0.05, 0.2); // Max 0.2 boost
        analysis.confidence = Math.max(analysis.confidence, 0.70 + confidenceBoost);

        analysis.indicators.push(`Filename contains AI indicators: ${foundKeywords.slice(0, 3).join(', ')}${foundKeywords.length > 3 ? '...' : ''}`);
        analysis.detectedFields.filenameKeywords = foundKeywords;

        // Try to determine generator from filename
        if (!analysis.generator) {
          const generatorKeywords = foundKeywords.filter(keyword =>
            this.aiSignatures.generators.includes(keyword.toLowerCase())
          );
          if (generatorKeywords.length > 0) {
            analysis.generator = generatorKeywords[0];
          }
        }

        // Try to determine type from filename
        if (analysis.type === 'authentic') {
          const enhancementKeywords = ['enhanced', 'enhance', 'edited', 'modified', 'converted', 'processed', 'upscaled'];
          const generationKeywords = ['generated', 'created', 'artificial', 'synthetic'];

          const hasEnhancementTerms = foundKeywords.some(keyword =>
            enhancementKeywords.includes(keyword.toLowerCase())
          );
          const hasGenerationTerms = foundKeywords.some(keyword =>
            generationKeywords.includes(keyword.toLowerCase())
          );

          if (hasEnhancementTerms && hasGenerationTerms) {
            analysis.type = 'enhanced';
          } else if (hasEnhancementTerms) {
            analysis.type = 'enhanced';
          } else if (hasGenerationTerms) {
            analysis.type = 'generated';
          } else {
            analysis.type = 'generated'; // Default if AI detected
          }
        }

        // Add note about filename detection
        analysis.indicators.push('Note: Detection partially based on filename - metadata analysis preferred');

      } else if (isUuidPattern) {
        // UUID pattern detected - very weak signal due to high false positive risk
        analysis.isAI = true;
        analysis.confidence = Math.max(analysis.confidence, 0.45); // Very low confidence

        analysis.indicators.push('Filename follows UUID pattern (weak signal - many legitimate uses)');
        analysis.detectedFields.hasUuidPattern = true;

        // Default type for UUID pattern
        if (analysis.type === 'authentic') {
          analysis.type = 'generated'; // Assume generated if no other info
        }

        // Add note about weak signal
        analysis.indicators.push('Note: UUID pattern is a very weak signal - high false positive risk');
      }

    } catch (error) {
      console.error('Error in filename analysis:', error);
      analysis.indicators.push(`Filename analysis error: ${error.message}`);
    }
  }

  // SightEngine AI detection API integration
  async analyzeSightEngine(buffer, fileInfo, analysis) {
    try {
      console.log('Starting SightEngine AI detection analysis...');

      // Create FormData for the API request
      const formData = new FormData();

      // Create a blob from buffer
      const blob = new Blob([buffer], { type: fileInfo.type || 'image/jpeg' });
      formData.append('media', blob, fileInfo.name || 'image.jpg');
      formData.append('models', 'genai');
      formData.append('api_user', API_USER);
      formData.append('api_secret', API_SECRET);

      // Make API request
      const response = await fetch('https://api.sightengine.com/1.0/check.json', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`SightEngine API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Log the full response for debugging
      console.log('SightEngine API Response:', JSON.stringify(result, null, 2));

      // Check if the response has the expected structure
      if (result.status === 'success' && result.type && result.type.ai_generated !== undefined) {
        const aiScore = result.type.ai_generated; // This is a decimal (e.g., 0.85 = 85%)
        const aiPercentage = Math.round(aiScore * 100);

        analysis.detectedFields.sightengine_response = result;
        analysis.detectedFields.sightengine_ai_score = aiScore;

        // Consider it AI if score is above 50%
        if (aiScore > 0.5) {
          analysis.isAI = true;
          analysis.confidence = Math.max(analysis.confidence, aiScore); // Use the AI score as confidence
          analysis.indicators.push(`SightEngine AI detection: ${aiPercentage}% AI-generated`);

          // If no type is set yet, default to generated
          if (analysis.type === 'authentic') {
            analysis.type = 'generated';
          }
        } else {
          // Even if below threshold, log the score as an indicator
          analysis.indicators.push(`SightEngine AI detection: ${aiPercentage}% AI-generated (below threshold)`);
        }

        // Add API metadata
        if (result.request) {
          analysis.detectedFields.sightengine_request_id = result.request.id;
        }
        if (result.media) {
          analysis.detectedFields.sightengine_media_id = result.media.id;
        }

      } else {
        console.error('Unexpected SightEngine response structure:', result);
        analysis.indicators.push('SightEngine API: Unexpected response structure');
        analysis.detectedFields.sightengine_error = 'Unexpected response structure';
      }

    } catch (error) {
      console.error('SightEngine API error:', error);
      analysis.indicators.push(`SightEngine API error: ${error.message}`);
      analysis.detectedFields.sightengine_error = error.message;
    }
  }
}

const API_USER='515969408'
const API_SECRET='jZ4NjXMr7ifyYHVJSCNGBWs87Z24Gb3H'

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer for server-side processing
    const buffer = Buffer.from(await file.arrayBuffer());

    // Prepare file info for analysis
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type
    };

    // Analyze the image
    const detector = new ServerAIImageDetector();
    const analysis = await detector.analyzeImageBuffer(buffer, fileInfo);

    // Add file info to response
    analysis.fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('AI Image Detection API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: error.message,
        isAI: false,
        confidence: 0,
        type: 'unknown'
      },
      { status: 500 }
    );
  }
}