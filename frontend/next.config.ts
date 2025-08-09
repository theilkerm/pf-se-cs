/** @type {import('next').NextConfig} */
const nextConfig = {
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
      { protocol: 'http', hostname: 'localhost', port: '3001' },
    ],
  },
};

export default nextConfig;