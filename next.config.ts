import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  experimental: {
    serverSourceMaps: true,
  },
  eslint: {
    dirs: ['src', 'tests'],
  },
};

export default nextConfig;
