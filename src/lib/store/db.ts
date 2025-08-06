import 'server-only';

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { DEFAULT_ENVIRONMENTS, type Project, type Secret } from '@/lib/definitions';

// Projects

function toProject(project: StoreProject) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { secrets, ...data } = project;
  return data;
}

export async function getProjects(): Promise<Project[]> {
  const { projects } = await DataLayer.read();
  return projects.map((p) => toProject(p));
}

export async function getProject(id: string): Promise<Project | undefined> {
  const { projects } = await DataLayer.read();
  const project = projects.find((p) => p.id === id);
  return project ? toProject(project) : undefined;
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const { projects: allProjects } = await DataLayer.read();

  const newProject: StoreProject = {
    id: crypto.randomUUID(),
    name: project.name,
    description: project.description || '',
    color: project.color,
    secrets: [],
  };
  const lowerProjectName = newProject.name.toLowerCase();
  if (allProjects.find((p) => p.name.toLowerCase() === lowerProjectName)) {
    throw new Error(`Project with name "${newProject.name}" already exists.`);
  }
  await DataLayer.write({ projects: [...allProjects, newProject] });
  return toProject(newProject);
}

export async function deleteProject(id: string): Promise<void> {
  const { projects } = await DataLayer.read();
  const index = projects.findIndex((p) => p.id === id);
  if (index > -1) {
    projects.splice(index, 1);
    await DataLayer.write({ projects });
  }
}

export async function updateProject(project: Omit<Project, 'secrets'>): Promise<Project> {
  const { projects } = await DataLayer.read();
  const data = projects.find((p) => p.id === project.id);
  if (!data) {
    throw new Error('Project not found');
  }

  data.name = project.name;
  data.description = project.description;
  data.color = project.color;
  await DataLayer.write({ projects });
  return data;
}

// Secrets
export async function createSecret(projectId: string, secret: Omit<Secret, 'id' | 'lastUpdated'>): Promise<Secret> {
  const { projects: allProjects } = await DataLayer.read();
  const project = allProjects.find((p) => p.id === projectId);
  if (!project) throw new Error(`Project with name "${projectId}" does not exist.`);

  const newSecret: Secret = {
    id: crypto.randomUUID(),
    name: secret.name,
    value: encryptValue(secret.value),
    type: secret.type,
    description: secret.description,
    lastUpdated: new Date().toISOString(),
    environmentId: secret.environmentId,
  };
  project.secrets.push(newSecret);
  await DataLayer.write({ projects: allProjects });
  return newSecret;
}

export async function getSecrets(projectId: string): Promise<Secret[]> {
  const { projects } = await DataLayer.read();
  const project = projects.find((p) => p.id === projectId);
  if (!project) throw new Error(`Project with name "${projectId}" does not exist.`);
  return project.secrets;
}

export async function getSecretValue(projectId: string, secretId: string) {
  const { projects } = await DataLayer.read();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error(`Project with id "${projectId}" does not exist.`);
  }

  const secret = project.secrets.find((s) => s.id === secretId);
  if (!secret) {
    throw new Error(`Secret with id "${secretId}" does not exist in project.`);
  }

  const secretValue = secret.value;
  return decryptValue(secretValue);
}

export async function deleteSecret(projectId: string, secretId: string): Promise<void> {
  const { projects } = await DataLayer.read();
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    const index = project.secrets.findIndex((p) => p.id === secretId);
    if (index > -1) {
      project.secrets.splice(index, 1);
      await DataLayer.write({ projects });
    }
  }
}

export async function updateSecret(projectId: string, secret: Omit<Secret, 'lastUpdated' | 'value'>): Promise<Secret> {
  const { projects } = await DataLayer.read();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error(`Project with id "${projectId}" does not exist.`);
  }

  const data = project.secrets.find((s) => s.id === secret.id);
  if (!data) {
    throw new Error(`Secret with id "${secret.id}" does not exist in project.`);
  }

  // Update the secret properties directly
  data.name = secret.name;
  data.description = secret.description;
  data.type = secret.type;
  data.lastUpdated = new Date().toISOString();
  data.environmentId = secret.environmentId;

  await DataLayer.write({ projects });
  return data;
}

export async function updateSecretValue(projectId: string, secretId: string, secretValue: string): Promise<void> {
  const { projects } = await DataLayer.read();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error(`Project with id "${projectId}" does not exist.`);
  }

  const data = project.secrets.find((s) => s.id === secretId);
  if (!data) {
    throw new Error(`Secret with id "${secretId}" does not exist in project.`);
  }

  // Update the secret value and last updated timestamp
  data.value = encryptValue(secretValue);
  data.lastUpdated = new Date().toISOString();

  await DataLayer.write({ projects });
}

//------
type StoreProject = Project & {
  secrets: Secret[];
};

export const dataFilePath = path.resolve(process.env.DATA_FILE_PATH!);
export const dataFileEncKey = process.env.DATA_FILE_ENC_KEY;
const dataFileEncAlgorithm = process.env.DATA_FILE_ENC_ALGO || 'aes-256-cbc';
const dataFileEncSalt = process.env.DATA_FILE_ENC_SALT || 'salt';
const isEncryptionEnabled = !!dataFileEncKey;

// Encrypt a string value if encryption is enabled
function encryptValue(text: string): string {
  try {
    if (!isEncryptionEnabled) {
      return text;
    }
    // Create a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create a cipher using the key and iv
    const cipher = crypto.createCipheriv(
      dataFileEncAlgorithm,
      crypto.scryptSync(dataFileEncKey!, dataFileEncSalt, 32),
      iv,
    );

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
    const decipher = crypto.createDecipheriv(
      dataFileEncAlgorithm,
      crypto.scryptSync(dataFileEncKey!, dataFileEncSalt, 32),
      iv,
    );

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
}

const DataLayer = {
  async write(data: { projects: StoreProject[] }) {
    await fs.writeFile(dataFilePath, JSON.stringify({ ...data, environments: DEFAULT_ENVIRONMENTS }, null, 2), 'utf-8');
  },
  async read(): Promise<{ projects: StoreProject[] }> {
    try {
      const data = await fs.readFile(dataFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      if (isErrnoException(err) && err.code === 'ENOENT') {
        return {
          projects: [],
        };
      }
      throw err;
    }
  },
};

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error != null && typeof error === 'object' && 'errno' in error;
}
