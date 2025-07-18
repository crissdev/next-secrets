import { type Project } from '@/lib/definitions';
import { createProjectSchema } from '@/lib/services/schemas';
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
