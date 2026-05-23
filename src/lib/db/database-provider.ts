import path from 'node:path';

export type DatabaseProvider = 'postgresql' | 'sqlite';

export interface DatabaseEnv {
  DATABASE_PROVIDER?: string;
  DATABASE_URL?: string;
}

export interface DatabaseConfig {
  provider: DatabaseProvider;
  url: string;
}

export function getDatabaseConfig(env: DatabaseEnv = process.env as DatabaseEnv): DatabaseConfig {
  const provider = getDatabaseProvider(env);
  const url = env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error('DATABASE_URL must be set.');
  }

  assertDatabaseUrlMatchesProvider(provider, url);

  return {
    provider,
    url: provider === 'sqlite' ? normalizeSqliteDatabaseUrl(url) : url,
  };
}

export function getDatabaseProvider(env: DatabaseEnv = process.env as DatabaseEnv): DatabaseProvider {
  const explicitProvider = env.DATABASE_PROVIDER?.trim().toLowerCase();
  if (explicitProvider) {
    if (explicitProvider === 'postgres') return 'postgresql';
    if (explicitProvider === 'postgresql' || explicitProvider === 'sqlite') return explicitProvider;
    throw new Error('DATABASE_PROVIDER must be "postgresql" or "sqlite".');
  }

  return env.DATABASE_URL?.startsWith('file:') ? 'sqlite' : 'postgresql';
}

function assertDatabaseUrlMatchesProvider(provider: DatabaseProvider, url: string) {
  if (provider === 'sqlite') {
    if (url === ':memory:' || url.startsWith('file:')) return;
    throw new Error('SQLite requires DATABASE_URL to be a file: URL, for example file:./dev.db.');
  }

  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return;
  throw new Error('PostgreSQL requires DATABASE_URL to start with postgres:// or postgresql://.');
}

function normalizeSqliteDatabaseUrl(url: string) {
  if (url === ':memory:') return url;

  const sqlitePath = url.slice('file:'.length);
  if (path.isAbsolute(sqlitePath)) return url;

  return `file:${path.resolve(process.cwd(), sqlitePath)}`;
}
