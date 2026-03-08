import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,

  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],

  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
