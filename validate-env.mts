import { styleText } from 'node:util';

import nextEnv from '@next/env';
import z, { type ZodError } from 'zod';

const envSchema = z.object({
  DATA_FILE_PATH: z.string().min(1, 'DATA_FILE_PATH must be set to a file name'),
});

nextEnv.loadEnvConfig(process.cwd(), true);

try {
  envSchema.parse(process.env);
} catch (err) {
  if (!isZodError(err)) throw err;
  console.error(styleText('red', 'Environment variables are not valid.'));
  console.error(styleText('red', err.toString()));
  process.exit(1);
}

function isZodError(err: unknown): err is ZodError {
  return (err as ZodError).name === 'ZodError';
}
