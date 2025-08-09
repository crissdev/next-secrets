import type { Secret } from '@/lib/definitions';
import { createSecretSchema, updateSecretSchema } from '@/lib/services/schemas';
import * as db from '@/lib/store/db';

export async function createSecret(projectId: string, input: Omit<Secret, 'id' | 'lastUpdated'>): Promise<Secret> {
  const secretInput = createSecretSchema.parse(input);
  const newSecret = await db.createSecret(projectId, {
    name: secretInput.name,
    description: secretInput.description,
    type: secretInput.type,
    value: secretInput.value,
    environmentId: secretInput.environmentId,
  });
  return newSecret;
}

export async function getSecrets(projectId: string): Promise<Secret[]> {
  const secrets = await db.getSecrets(projectId);
  return secrets.map((secret) => ({
    ...secret,
    value: '[REDACTED]',
  }));
}

export async function getSecretValue(projectId: string, secretId: string): Promise<string> {
  const secretValue = await db.getSecretValue(projectId, secretId);
  return secretValue;
}

export async function updateSecret(projectId: string, input: Omit<Secret, 'lastUpdated' | 'value'>): Promise<Secret> {
  const secretInput = updateSecretSchema.parse(input);
  const updatedSecret = await db.updateSecret(projectId, {
    id: secretInput.id,
    name: secretInput.name,
    description: secretInput.description,
    type: secretInput.type,
    environmentId: secretInput.environmentId,
  });
  return {
    ...updatedSecret,
    value: '[REDACTED]',
  };
}

export async function downloadSecrets(projectId: string, secretIds?: string[]) {
  const secrets = await db.getSecrets(projectId);
  const filteredSecrets = secretIds?.length ? secrets.filter((secret) => secretIds.includes(secret.id)) : secrets;
  return filteredSecrets.map((secret) => ({
    name: secret.name,
    value: secret.value,
  }));
}
