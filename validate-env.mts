import { styleText } from 'node:util';

import nextEnv from '@next/env';
import z, { type ZodError } from 'zod';

const envSchema = z
  .object({
    DATABASE_PROVIDER: z.string().optional(),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL must be set'),
  })
  .superRefine((env, ctx) => {
    const provider = getDatabaseProvider(env.DATABASE_PROVIDER, env.DATABASE_URL);
    if (!provider) {
      ctx.addIssue({
        code: 'custom',
        path: ['DATABASE_PROVIDER'],
        message: 'DATABASE_PROVIDER must be "postgresql" or "sqlite".',
      });
      return;
    }

    if (provider === 'sqlite') {
      if (env.DATABASE_URL === ':memory:' || env.DATABASE_URL.startsWith('file:')) return;
      ctx.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message: 'SQLite requires DATABASE_URL to be a file: URL, for example file:./dev.db.',
      });
      return;
    }

    if (env.DATABASE_URL.startsWith('postgres://') || env.DATABASE_URL.startsWith('postgresql://')) return;
    ctx.addIssue({
      code: 'custom',
      path: ['DATABASE_URL'],
      message: 'PostgreSQL requires DATABASE_URL to start with postgres:// or postgresql://.',
    });
  })
  .and(
    z
      .object({
        DATA_ENC_KEY: z.string().refine((v) => !v?.trim()),
      })
      .or(
        z.object({
          DATA_ENC_KEY: z.string().min(1, 'DATA_ENC_KEY must be set to a valid key'),
          DATA_ENC_ALGO: z.string().default('aes-256-cbc'),
          DATA_ENC_SALT: z.string().min(16, 'DATA_ENC_SALT must be at least 16 characters long'),
        }),
      ),
  );

const { loadedEnvFiles } = nextEnv.loadEnvConfig(process.cwd(), true);
console.log(
  'Loaded env files:',
  loadedEnvFiles.map((e) => e.path),
);

try {
  envSchema.parse(process.env);
  console.log('Environment variables are valid.');
} catch (err) {
  if (!isZodError(err)) throw err;
  console.error(styleText('red', 'Environment variables are not valid.'));
  console.error(styleText('red', err.toString()));
  process.exit(1);
}

function isZodError(err: unknown): err is ZodError {
  return (err as ZodError).name === 'ZodError';
}

function getDatabaseProvider(provider: string | undefined, databaseUrl: string) {
  const explicitProvider = provider?.trim().toLowerCase();
  if (explicitProvider) {
    if (explicitProvider === 'postgres') return 'postgresql';
    if (explicitProvider === 'postgresql' || explicitProvider === 'sqlite') return explicitProvider;
    return null;
  }

  return databaseUrl.startsWith('file:') ? 'sqlite' : 'postgresql';
}
