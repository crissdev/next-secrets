import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

import type { Project } from '@/lib/definitions';

export async function getProjects(): Promise<Project[]> {
  const { projects } = await DataLayer.read();
  return projects;
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const newProject: Project = {
    id: crypto.randomUUID(),
    name: project.name,
    description: project.description || '',
  };

  const allProjects = await getProjects();
  const lowerProjectName = newProject.name.toLowerCase();
  if (allProjects.find((p) => p.name.toLowerCase() === lowerProjectName)) {
    throw new Error(`Project with name "${newProject.name}" already exists.`);
  }
  await DataLayer.write({ projects: [...allProjects, newProject] });
  return newProject;
}

//------
export const dataFilePath = path.resolve(process.env.DATA_FILE_PATH!);

const DataLayer = {
  async write(data: { projects: Project[] }) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  },
  async read(): Promise<{ projects: Project[] }> {
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
