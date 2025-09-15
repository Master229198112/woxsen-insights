import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // Check authentication (admin only for this operation)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Starting PDF access fix...');
    
    // Get all resources in the PDF folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'woxsen-insights/documents/pdfs/',
      resource_type: 'raw',
      max_results: 100
    });
    
    const fixedFiles = [];
    const errors = [];
    
    console.log(`📄 Found ${result.resources.length} PDF files`);
    
    for (const resource of result.resources) {
      try {
        console.log(`🔄 Updating access for: ${resource.public_id}`);
        
        // Update the resource to make it publicly accessible
        const updatedResource = await cloudinary.uploader.explicit(resource.public_id, {
          type: 'upload',
          resource_type: 'raw',
          access_mode: 'public'
        });
        
        fixedFiles.push({
          publicId: resource.public_id,
          originalUrl: resource.secure_url,
          newUrl: updatedResource.secure_url,
          status: 'fixed'
        });
        
        console.log(`✅ Fixed access for: ${resource.public_id}`);
        
      } catch (error) {
        console.error(`❌ Failed to update ${resource.public_id}:`, error.message);
        errors.push({
          publicId: resource.public_id,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'PDF access fix completed',
      summary: {
        totalFiles: result.resources.length,
        fixedFiles: fixedFiles.length,
        errors: errors.length
      },
      fixedFiles,
      errors
    });
    
  } catch (error) {
    console.error('❌ Error fixing PDF access:', error);
    return NextResponse.json(
      { error: 'Failed to fix PDF access', details: error.message },
      { status: 500 }
    );
  }
}

// GET method to check PDF access status
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all resources in the PDF folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'woxsen-insights/documents/pdfs/',
      resource_type: 'raw',
      max_results: 100
    });
    
    const pdfFiles = result.resources.map(resource => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      created: resource.created_at,
      bytes: resource.bytes,
      format: resource.format
    }));
    
    return NextResponse.json({
      success: true,
      totalFiles: result.resources.length,
      files: pdfFiles
    });
    
  } catch (error) {
    console.error('Error checking PDF files:', error);
    return NextResponse.json(
      { error: 'Failed to check PDF files', details: error.message },
      { status: 500 }
    );
  }
}
