import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,

  serverExternalPackages: ['better-sqlite3', 'pino', 'pino-pretty', 'thread-stream'],
};

export default nextConfig;
