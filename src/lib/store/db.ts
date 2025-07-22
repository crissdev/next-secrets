import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

import type { Project, Secret } from '@/lib/definitions';

export async function deleteProject(id: string) {
  const { projects } = await DataLayer.read();
  const index = projects.findIndex((p) => p.id === id);
  if (index > -1) {
    projects.splice(index, 1);
  }
  await DataLayer.write({
    projects,
  });
}

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

// Secrets
export async function createSecret(projectId: string, secret: Omit<Secret, 'id'>): Promise<Secret> {
  const { projects: allProjects } = await DataLayer.read();
  const project = allProjects.find((p) => p.id === projectId);
  if (!project) throw new Error(`Project with name "${projectId}" does not exist.`);

  const newSecret = {
    id: crypto.randomUUID(),
    name: secret.name,
    value: secret.value,
    type: secret.type,
    description: secret.description,
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
