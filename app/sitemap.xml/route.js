// app/sitemap.xml/route.js
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

async function getPublishedBlogs() {
  try {
    const db = await connectToDatabase();
    const blogs = await db.collection('blogs')
      .find({ 
        status: 'published',
        publishedAt: { $exists: true } 
      })
      .sort({ publishedAt: -1 })
      .toArray();
    
    return blogs;
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
    return [];
  }
}

async function getAuthors() {
  try {
    const db = await connectToDatabase();
    const users = await db.collection('users')
      .find({ 
        role: { $in: ['admin', 'author'] },
        approved: true 
      })
      .toArray();
    
    return users;
  } catch (error) {
    console.error('Error fetching authors for sitemap:', error);
    return [];
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://sobinsights.aircwou.in';
    const blogs = await getPublishedBlogs();
    const authors = await getAuthors();
    
    const currentDate = new Date().toISOString();
    
    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Categories -->
  <url>
    <loc>${baseUrl}/category/business</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/category/academics</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/category/insights</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/category/research</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Blog Posts -->
${blogs.map(blog => `  <url>
    <loc>${baseUrl}/blog/${blog.slug || blog._id}</loc>
    <lastmod>${blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date(blog.publishedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    ${blog.featuredImage ? `<image:image>
      <image:loc>${blog.featuredImage}</image:loc>
      <image:title>${blog.title.replace(/[&<>"']/g, (match) => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
        return escapeMap[match];
      })}</image:title>
    </image:image>` : ''}
  </url>`).join('\n')}

  <!-- Author Pages -->
${authors.map(author => `  <url>
    <loc>${baseUrl}/author/${author._id}</loc>
    <lastmod>${author.updatedAt ? new Date(author.updatedAt).toISOString() : currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}

  <!-- Newsletter -->
  <url>
    <loc>${baseUrl}/newsletter</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

</urlset>`.trim();

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, background refresh for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}