import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

import type { Project, Secret } from '@/lib/definitions';

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
  await DataLayer.write({ projects });
  return data;
}

// Secrets
export async function createSecret(projectId: string, secret: Omit<Secret, 'id' | 'lastUpdated'>): Promise<Secret> {
  const { projects: allProjects } = await DataLayer.read();
  const project = allProjects.find((p) => p.id === projectId);
  if (!project) throw new Error(`Project with name "${projectId}" does not exist.`);

  const newSecret = {
    id: crypto.randomUUID(),
    name: secret.name,
    value: secret.value,
    type: secret.type,
    description: secret.description,
    lastUpdated: new Date().toISOString(),
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

export async function updateSecret(projectId: string, secret: Omit<Secret, 'lastUpdated'>): Promise<Secret> {
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
  data.value = secret.value;
  data.lastUpdated = new Date().toISOString();

  await DataLayer.write({ projects });
  return data;
}

//------
type StoreProject = Project & {
  secrets: Secret[];
};

export const dataFilePath = path.resolve(process.env.DATA_FILE_PATH!);

const DataLayer = {
  async write(data: { projects: StoreProject[] }) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
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
