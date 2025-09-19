import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import type { Project } from '@/lib/definitions';
import { createProjectSchema, updateProjectSchema } from '@/lib/services/schemas';
import * as db from '@/lib/store/db';

export async function getProjects() {
  return await db.getProjects();
}

export async function createProject(input: Omit<Project, 'id'>): Promise<Project> {
  const projectInput = createProjectSchema.parse(input);

  try {
    const newProject = await db.createProject({
      name: projectInput.name,
      description: projectInput.description,
      color: projectInput.color,
    });
    return newProject;
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new Error(`Project with name "${projectInput.name}" already exists`);
    }
    throw err;
  }
}

export function getProject(id: string): Promise<Project | null> {
  return db.getProject(id);
}

export async function updateProject(input: Omit<Project, 'secrets'>): Promise<Project> {
  const projectInput = updateProjectSchema.parse(input);
  const updatedProject = await db.updateProject({
    id: projectInput.id,
    name: projectInput.name,
    description: projectInput.description,
    color: projectInput.color,
  });
  return updatedProject;
}

export async function deleteProject(id: string): Promise<void> {
  await db.deleteProject(id);
}
