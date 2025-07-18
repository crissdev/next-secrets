'use server';

import { type Project } from '@/lib/definitions';
import { revalidateProjects } from '@/lib/queries';
import { createProject } from '@/lib/services/projects.service';

export async function createProjectAction(data: Omit<Project, 'id'>) {
  try {
    const { name, description } = data;
    const newProject = await createProject({ name, description });
    revalidateProjects();
    return { success: true as const, data: newProject };
  } catch (err) {
    return { success: false as const, error: err as Error };
  }
}
