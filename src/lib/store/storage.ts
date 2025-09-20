import 'server-only';

import crypto from 'node:crypto';

import { type Project, type Secret } from '@/lib/definitions';
import * as db from '@/lib/store/db';

// Projects

export async function getProjects(): Promise<Project[]> {
  return await db.getProjects();
}

export async function getProject(id: string): Promise<Project | null> {
  return await db.getProject(id);
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const newProject: Project = {
    id: crypto.randomUUID(),
    name: project.name,
    description: project.description || '',
    color: project.color,
  };
  return await db.addProject(newProject);
}

export async function deleteProject(id: string): Promise<void> {
  return await db.deleteProject(id);
}

export async function updateProject(project: Omit<Project, 'secrets'>): Promise<Project> {
  return await db.updateProject(project.id, project);
}

// Secrets
export async function createSecret(
  projectId: string,
  secret: Omit<Secret, 'id' | 'updatedAt' | 'projectId'>,
): Promise<Secret> {
  const newSecret: Secret = {
    id: crypto.randomUUID(),
    name: secret.name,
    value: encryptValue(secret.value),
    type: secret.type,
    description: secret.description,
    updatedAt: new Date(),
    environmentId: secret.environmentId,
    projectId,
  };
  return await db.createSecret(newSecret);
}

export async function getSecrets(projectId: string): Promise<Secret[]> {
  return await db.getSecrets(projectId);
}

export async function getSecretValue(secretId: string) {
  const value = await db.getSecretValue(secretId);
  return decryptValue(value);
}

export async function deleteSecret(secretId: string): Promise<void> {
  return await db.deleteSecret(secretId);
}

export async function updateSecret(secret: Omit<Secret, 'updatedAt' | 'value' | 'projectId'>): Promise<Secret> {
  return await db.updateSecret(secret);
}

export async function updateSecretValue(secretId: string, secretValue: string): Promise<void> {
  return await db.updateSecretValue(secretId, encryptValue(secretValue));
}

//------
export const dataEncKey = process.env.DATA_ENC_KEY;
const dataEncAlgorithm = process.env.DATA_ENC_ALGO || 'aes-256-cbc';
const dataEncSalt = process.env.DATA_ENC_SALT || 'salt';
const isEncryptionEnabled = !!dataEncKey;

// Encrypt a string value if encryption is enabled
function encryptValue(text: string): string {
  try {
    if (!isEncryptionEnabled) {
      return text;
    }
    // Create a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create a cipher using the key and iv
    const cipher = crypto.createCipheriv(dataEncAlgorithm, crypto.scryptSync(dataEncKey!, dataEncSalt, 32), iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return iv and encrypted data as a single string
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Return original text if encryption fails
  }
}

// Decrypt an encrypted value if encryption is enabled
function decryptValue(encryptedText: string): string {
  if (!isEncryptionEnabled) {
    return encryptedText;
  }

  try {
    // Check if the text has the format of our encrypted data
    if (!encryptedText.includes(':')) {
      return encryptedText; // Not in the expected format, return as is
    }

    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    // Create a decipher using the key and iv
    const decipher = crypto.createDecipheriv(dataEncAlgorithm, crypto.scryptSync(dataEncKey!, dataEncSalt, 32), iv);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
}
