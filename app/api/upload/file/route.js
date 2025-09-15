import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File type configurations
const fileConfigs = {
  image: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'woxsen-insights/images',
    resourceType: 'image',
    transformations: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
    ]
  },
  pdf: {
    allowedTypes: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'woxsen-insights/documents/pdfs',
    resourceType: 'raw',
    generateThumbnail: true
  },
  document: {
    allowedTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'woxsen-insights/documents/general',
    resourceType: 'raw'
  }
};

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('fileType') || 'auto'; // 'image', 'pdf', 'document', or 'auto'

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Determine file category
    let category = fileType;
    if (fileType === 'auto') {
      if (file.type.startsWith('image/')) {
        category = 'image';
      } else if (file.type === 'application/pdf') {
        category = 'pdf';
      } else {
        category = 'document';
      }
    }

    const config = fileConfigs[category];
    if (!config) {
      return NextResponse.json({ error: 'Unsupported file category' }, { status: 400 });
    }

    // Validate file type
    if (!config.allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > config.maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${Math.round(config.maxSize / (1024 * 1024))}MB` 
      }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}_${sanitizedName}`;

    // Upload to Cloudinary
    const uploadOptions = {
      folder: config.folder,
      public_id: uniqueFilename,
      resource_type: config.resourceType,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      // Add user info to context for tracking
      context: {
        uploaded_by: session.user.email,
        uploaded_at: new Date().toISOString(),
        original_name: file.name,
        file_category: category
      }
    };

    // Add transformations for images
    if (category === 'image' && config.transformations) {
      uploadOptions.transformation = config.transformations;
    }

    // Add specific configurations for PDFs
    if (category === 'pdf') {
      // Make PDFs publicly accessible
      uploadOptions.access_mode = 'public';
      uploadOptions.type = 'upload';
      // Remove attachment flag to allow direct viewing
      // uploadOptions.flags = 'attachment'; // Commented out to allow public access
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    // Prepare response data
    const responseData = {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      originalFilename: file.name,
      fileSize: file.size,
      fileType: file.type,
      category: category,
      uploadedAt: new Date().toISOString(),
      format: uploadResult.format,
      resourceType: uploadResult.resource_type
    };

    // For PDFs, try to generate a thumbnail preview
    if (category === 'pdf' && config.generateThumbnail) {
      try {
        // Generate thumbnail of the first page
        const thumbnailResult = await cloudinary.uploader.upload(uploadResult.secure_url, {
          folder: `${config.folder}/thumbnails`,
          public_id: `thumb_${uniqueFilename}`,
          resource_type: 'image',
          format: 'jpg',
          transformation: [
            { width: 300, height: 400, crop: 'fit', page: 1, quality: 'auto' }
          ],
          flags: 'attachment'
        });
        
        responseData.thumbnailUrl = thumbnailResult.secure_url;
      } catch (thumbError) {
        console.error('PDF thumbnail generation failed:', thumbError);
        // Don't fail the upload if thumbnail generation fails
      }
    }

    // Add image-specific metadata
    if (category === 'image') {
      responseData.width = uploadResult.width;
      responseData.height = uploadResult.height;
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error.http_code === 413) {
      return NextResponse.json(
        { error: 'File too large for upload service' },
        { status: 413 }
      );
    }
    
    if (error.http_code === 415) {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 415 }
      );
    }

    return NextResponse.json(
      { error: 'File upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET method to retrieve file information
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const category = searchParams.get('category') || 'image';

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 });
    }

    const config = fileConfigs[category];
    if (!config) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Get file details from Cloudinary
    const result = await cloudinary.api.resource(publicId, {
      resource_type: config.resourceType
    });

    const fileInfo = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      fileSize: result.bytes,
      uploadedAt: result.created_at,
      resourceType: result.resource_type
    };

    // Add image-specific data
    if (category === 'image') {
      fileInfo.width = result.width;
      fileInfo.height = result.height;
    }

    return NextResponse.json({
      success: true,
      file: fileInfo
    });

  } catch (error) {
    console.error('File info retrieval error:', error);
    
    if (error.http_code === 404) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to retrieve file information' },
      { status: 500 }
    );
  }
}

// DELETE method to remove files
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const category = searchParams.get('category') || 'image';

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 });
    }

    const config = fileConfigs[category];
    if (!config) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, {
      resource_type: config.resourceType
    });

    // If it's a PDF with thumbnail, also delete the thumbnail
    if (category === 'pdf') {
      try {
        const thumbnailPublicId = `${config.folder}/thumbnails/thumb_${publicId.split('/').pop()}`;
        await cloudinary.uploader.destroy(thumbnailPublicId, {
          resource_type: 'image'
        });
      } catch (thumbError) {
        console.error('Failed to delete PDF thumbnail:', thumbError);
        // Don't fail the main delete operation
      }
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
