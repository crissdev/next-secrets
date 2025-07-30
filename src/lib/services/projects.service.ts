import type { Project } from '@/lib/definitions';
import { createProjectSchema, updateProjectSchema } from '@/lib/services/schemas';
import * as db from '@/lib/store/db';

export async function getProjects() {
  return await db.getProjects();
}

export async function createProject(input: Omit<Project, 'id'>): Promise<Project> {
  const projectInput = createProjectSchema.parse(input);

  const newProject = await db.createProject({
    name: projectInput.name,
    description: projectInput.description,
  });
  return newProject;
}

export function getProject(id: string): Promise<Project | undefined> {
  return db.getProject(id);
}

export async function updateProject(input: Omit<Project, 'secrets'>): Promise<Project> {
  const projectInput = updateProjectSchema.parse(input);
  const updatedProject = await db.updateProject({
    id: projectInput.id,
    name: projectInput.name,
    description: projectInput.description,
  });
  return updatedProject;
}

export async function deleteProject(id: string): Promise<void> {
  await db.deleteProject(id);
}
