import path from 'node:path';

import { describe, expect, test } from 'vitest';

import { getDatabaseConfig, getDatabaseProvider } from '@/lib/db/database-provider';

describe('database provider config', () => {
  test('uses explicit PostgreSQL provider', () => {
    expect(
      getDatabaseConfig({
        DATABASE_PROVIDER: 'postgresql',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/secrets',
      }),
    ).toEqual({
      provider: 'postgresql',
      url: 'postgresql://user:pass@localhost:5432/secrets',
    });
  });

  test('infers SQLite from file URL and resolves relative paths from the project root', () => {
    expect(getDatabaseProvider({ DATABASE_URL: 'file:./dev.db' })).toBe('sqlite');
    expect(getDatabaseConfig({ DATABASE_URL: 'file:./dev.db' })).toEqual({
      provider: 'sqlite',
      url: `file:${path.resolve(process.cwd(), './dev.db')}`,
    });
  });

  test('rejects mismatched provider and URL values', () => {
    expect(() =>
      getDatabaseConfig({
        DATABASE_PROVIDER: 'sqlite',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/secrets',
      }),
    ).toThrow('SQLite requires DATABASE_URL to be a file: URL');

    expect(() =>
      getDatabaseConfig({
        DATABASE_PROVIDER: 'postgresql',
        DATABASE_URL: 'file:./dev.db',
      }),
    ).toThrow('PostgreSQL requires DATABASE_URL to start with postgres:// or postgresql://');
  });
});
