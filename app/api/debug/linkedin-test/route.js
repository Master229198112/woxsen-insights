// app/api/debug/linkedin-test/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
  }
  return client.db();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');
    const baseUrl = process.env.NEXTAUTH_URL || 'https://sobinsights.aircwou.in';
    
    if (!blogId) {
      return NextResponse.json({ 
        error: 'Please provide a blogId parameter',
        usage: 'Example: /api/debug/linkedin-test?blogId=YOUR_BLOG_ID'
      }, { status: 400 });
    }

    // Fetch the blog
    const db = await connectToDatabase();
    const blog = await db.collection('blogs').findOne({ 
      $or: [
        { _id: blogId },
        { slug: blogId }
      ]
    });

    if (!blog) {
      return NextResponse.json({ 
        error: 'Blog not found',
        blogId: blogId 
      }, { status: 404 });
    }

    // Fetch author details
    const author = await db.collection('users').findOne({ _id: blog.authorId });

    // Generate the metadata that LinkedIn will see
    const linkedinMetadata = {
      url: `${baseUrl}/blog/${blog.slug || blog._id}`,
      title: blog.title,
      description: blog.excerpt || blog.title,
      image: blog.featuredImage,
      type: 'article',
      publishedTime: blog.publishedAt,
      author: author?.name || 'Unknown Author',
      tags: blog.tags || [],
      
      // LinkedIn specific checks
      checks: {
        hasTitle: !!blog.title,
        hasDescription: !!(blog.excerpt || blog.title),
        hasImage: !!blog.featuredImage,
        hasValidUrl: true,
        imageAccessible: null, // We'll test this
        titleLength: blog.title?.length || 0,
        descriptionLength: (blog.excerpt || blog.title)?.length || 0,
        isPublished: blog.status === 'published',
        hasPublishDate: !!blog.publishedAt
      },
      
      // Recommendations
      recommendations: []
    };

    // Add recommendations based on checks
    if (linkedinMetadata.titleLength > 60) {
      linkedinMetadata.recommendations.push('Title is quite long - LinkedIn may truncate it');
    }
    if (linkedinMetadata.descriptionLength > 160) {
      linkedinMetadata.recommendations.push('Description is quite long - consider shortening for better display');
    }
    if (!blog.featuredImage) {
      linkedinMetadata.recommendations.push('No featured image - LinkedIn sharing will be less engaging');
    }
    if (!blog.excerpt) {
      linkedinMetadata.recommendations.push('No excerpt - using title as description');
    }
    if (blog.status !== 'published') {
      linkedinMetadata.recommendations.push('Blog is not published - LinkedIn cannot access it');
    }

    // Test image accessibility (simplified check)
    if (blog.featuredImage) {
      try {
        const imageResponse = await fetch(blog.featuredImage, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        linkedinMetadata.checks.imageAccessible = imageResponse.ok;
        if (!imageResponse.ok) {
          linkedinMetadata.recommendations.push('Featured image may not be accessible');
        }
      } catch (error) {
        linkedinMetadata.checks.imageAccessible = false;
        linkedinMetadata.recommendations.push('Featured image accessibility check failed');
      }
    }

    // Generate HTML preview (what LinkedIn scraper sees)
    const htmlPreview = `
<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${blog.title}" />
  <meta property="og:description" content="${blog.excerpt || blog.title}" />
  <meta property="og:image" content="${blog.featuredImage || ''}" />
  <meta property="og:url" content="${baseUrl}/blog/${blog.slug || blog._id}" />
  <meta property="og:type" content="article" />
  <meta property="og:published_time" content="${blog.publishedAt || ''}" />
  <meta property="og:author" content="${author?.name || ''}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${blog.title}" />
  <meta name="twitter:description" content="${blog.excerpt || blog.title}" />
  <meta name="twitter:image" content="${blog.featuredImage || ''}" />
  <title>${blog.title} - Woxsen Insights</title>
</head>
<body>
  <h1>${blog.title}</h1>
  <p>${blog.excerpt || 'No excerpt available'}</p>
</body>
</html>`.trim();

    return NextResponse.json({
      blog: {
        id: blog._id,
        slug: blog.slug,
        title: blog.title,
        status: blog.status
      },
      linkedinMetadata,
      htmlPreview,
      instructions: {
        testLinkedInSharing: [
          '1. Copy the blog URL above',
          '2. Go to LinkedIn Post Inspector (if available) or',
          '3. Try sharing the URL on LinkedIn',
          '4. Check if the preview shows correctly'
        ],
        debugUrls: {
          directBlogUrl: `${baseUrl}/blog/${blog.slug || blog._id}`,
          linkedInDebugger: 'https://www.linkedin.com/post-inspector/', // May not exist
          facebookDebugger: 'https://developers.facebook.com/tools/debug/'
        }
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('LinkedIn debug error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}