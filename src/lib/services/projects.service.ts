import type { Project } from '@/lib/definitions';
import { createProjectSchema, updateProjectSchema } from '@/lib/services/schemas';
import { UniqueConstraintError } from '@/lib/store/db';
import * as storage from '@/lib/store/storage';

export async function getProjects() {
  return await storage.getProjects();
}

export async function createProject(input: Omit<Project, 'id'>): Promise<Project> {
  const projectInput = createProjectSchema.parse(input);

  try {
    const newProject = await storage.createProject({
      name: projectInput.name,
      description: projectInput.description,
      color: projectInput.color,
    });
    return newProject;
  } catch (err) {
    if (err instanceof UniqueConstraintError && err.fields?.includes('name')) {
      throw new Error(`Project with name "${projectInput.name}" already exists`);
    }
    throw err;
  }
}

export function getProject(id: string): Promise<Project | null> {
  return storage.getProject(id);
}

export async function updateProject(input: Omit<Project, 'secrets'>): Promise<Project> {
  const projectInput = updateProjectSchema.parse(input);
  const updatedProject = await storage.updateProject({
    id: projectInput.id,
    name: projectInput.name,
    description: projectInput.description,
    color: projectInput.color,
  });
  return updatedProject;
}

export async function deleteProject(id: string): Promise<void> {
  await storage.deleteProject(id);
}
