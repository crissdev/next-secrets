import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typedRoutes: true,
  eslint: {
    dirs: ['src', 'tests'],
  },
};

export default nextConfig;
