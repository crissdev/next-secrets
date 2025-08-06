import { styleText } from 'node:util';

import nextEnv from '@next/env';
import z, { type ZodError } from 'zod';

const envSchema = z
  .object({
    DATA_FILE_PATH: z.string().min(1, 'DATA_FILE_PATH must be set to a file name'),
  })
  .and(
    z
      .object({
        DATA_FILE_ENC_KEY: z.string().refine((v) => !v?.trim()),
      })
      .or(
        z.object({
          DATA_FILE_ENC_KEY: z.string().min(1, 'DATA_FILE_ENC_KEY must be set to a valid key'),
          DATA_FILE_ENC_ALGO: z.string().default('aes-256-cbc'),
          DATA_FILE_ENC_SALT: z.string().min(16, 'DATA_FILE_ENC_SALT must be at least 16 characters long'),
        }),
      ),
  );

nextEnv.loadEnvConfig(process.cwd(), true);

try {
  const result = envSchema.parse(process.env);
  console.log(result);
} catch (err) {
  if (!isZodError(err)) throw err;
  console.error(styleText('red', 'Environment variables are not valid.'));
  console.error(styleText('red', err.toString()));
  process.exit(1);
}

function isZodError(err: unknown): err is ZodError {
  return (err as ZodError).name === 'ZodError';
}
