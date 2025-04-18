import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  publicRuntimeConfig: {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
};

export default nextConfig;
