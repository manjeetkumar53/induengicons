import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production deployment
  output: 'standalone',
  
  // Enable experimental features if needed
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'vercel.app', '*.vercel.app'],
    },
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Webpack optimization
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    // Add global polyfill for Edge Runtime compatibility
    config.plugins.push(
      new config.webpack.DefinePlugin({
        global: 'globalThis',
      })
    );
    
    return config;
  },
};

export default nextConfig;
