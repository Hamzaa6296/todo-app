import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // ADD THIS SECTION FOR THE DEFAULT SIGNUP PAGE
  async redirects() {
    return [
      {
        source: '/',           // When the user hits the main URL
        destination: '/signup', // Send them here
        permanent: true,       // Tells search engines this is the intended path
      },
    ];
  },
};

export default nextConfig;