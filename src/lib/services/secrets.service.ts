import { type Secret } from '@/lib/definitions';
import { createSecretSchema, updateSecretSchema } from '@/lib/services/schemas';
import * as db from '@/lib/store/db';

export async function createSecret(projectId: string, input: Omit<Secret, 'id'>): Promise<Secret> {
  const secretInput = createSecretSchema.parse(input);
  const newSecret = await db.createSecret(projectId, {
    name: secretInput.name,
    description: secretInput.description,
    type: secretInput.type,
    value: secretInput.value,
  });
  return newSecret;
}

export async function getSecrets(projectId: string): Promise<Secret[]> {
  const secrets = await db.getSecrets(projectId);
  return secrets;
}

export async function updateSecret(projectId: string, input: Secret): Promise<Secret> {
  const secretInput = updateSecretSchema.parse(input);
  const updatedSecret = await db.updateSecret(projectId, {
    id: secretInput.id,
    name: secretInput.name,
    description: secretInput.description,
    type: secretInput.type,
    value: secretInput.value,
  });
  return updatedSecret;
}
