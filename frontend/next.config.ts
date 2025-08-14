/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.jp',
      },
      // Localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      // Backend service for Docker network
      {
        protocol: 'http',
        hostname: 'backend',
        port: '3001',
      },
      // Dynamic configuration based on environment
      ...(process.env.BACKEND_HOST ? [{
        protocol: process.env.BACKEND_URL?.startsWith('https') ? 'https' : 'http',
        hostname: process.env.BACKEND_HOST,
        port: process.env.BACKEND_PORT,
      }] : []),
    ],
    // Use unoptimized images for development to avoid network issues
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Enable experimental features for better development experience
  experimental: {
    // Enable hot reloading improvements
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;