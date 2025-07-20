import { type Secret } from '@/lib/definitions';
import { createSecretSchema } from '@/lib/services/schemas';
import * as db from '@/lib/store/db';

export async function createSecret(projectId: string, input: Omit<Secret, 'id'>): Promise<Secret> {
  const secretInput = createSecretSchema.parse(input);
  const newSecret = await db.createSecret(projectId, {
    name: secretInput.name,
    description: secretInput.description,
    value: secretInput.value,
  });
  return newSecret;
}

export async function getSecrets(projectId: string): Promise<Secret[]> {
  const secrets = db.getSecrets(projectId);
  return secrets;
}
