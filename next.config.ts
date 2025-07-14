import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['src', 'tests'],
  },
};

export default nextConfig;
