import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["recharts"],
  serverExternalPackages: ["crypto-js"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '169.254.124.200',
        port: '5003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'ipmas.mapskil.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true, // Disable image optimization for external images
  },
  webpack: (config, { isServer }) => {
    // Handle video files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      exclude: /node_modules/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });
    return config;
  },
};

export default nextConfig;
