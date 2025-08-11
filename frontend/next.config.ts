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
      // Development
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      // Production - will be overridden by environment variable
      { protocol: 'http', hostname: '159.89.7.177', port: '3001' },
    ],
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