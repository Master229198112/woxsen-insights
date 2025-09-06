/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary (current primary image host)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // Google services
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'docs.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Microsoft OneDrive
      {
        protocol: 'https',
        hostname: 'onedrive.live.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '1drv.ms',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sharepoint.com',
        port: '',
        pathname: '/**',
      },
      // Dropbox
      {
        protocol: 'https',
        hostname: 'dropbox.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dl.dropboxusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Common image hosting services
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      // GitHub (for documentation images)
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      // University domains (add your specific domains)
      {
        protocol: 'https',
        hostname: '*.woxsen.edu.in',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'woxsen.edu.in',
        port: '',
        pathname: '/**',
      },
      // AWS S3 (common for academic institutions)
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // Azure Blob Storage
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      // Generic academic/educational domains
      {
        protocol: 'https',
        hostname: '*.edu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ac.in',
        port: '',
        pathname: '/**',
      },
    ],
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false, // Keep false for security
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  }
}

module.exports = nextConfig
