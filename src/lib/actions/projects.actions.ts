'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import { type Project, type Secret } from '@/lib/definitions';
import { revalidateProjects } from '@/lib/queries';
import { SERVICE_ERROR } from '@/lib/service-error-codes';
import { createProject, deleteProject, updateProject } from '@/lib/services/projects.service';
import { createSecret } from '@/lib/services/secrets.service';
import { deleteSecret } from '@/lib/store/db';

// Projects
export async function createProjectAction(data: Omit<Project, 'id'>) {
  try {
    const { name, description } = data;
    const newProject = await createProject({ name, description });
    revalidateProjects();
    return { success: true as const, data: newProject };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false as const,
        error: { code: SERVICE_ERROR.VALIDATION_FAILED, message: err.message },
      };
    }
    return {
      success: false as const,
      error: { code: SERVICE_ERROR.INTERNAL_ERROR, message: 'Failed to create project' },
    };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    await deleteProject(projectId);
    revalidateProjects();
    revalidatePath(`/projects/${projectId}`);
    return { success: true as const };
  } catch (err) {
    console.error(err);
    return {
      success: false as const,
      error: {
        code: SERVICE_ERROR.INTERNAL_ERROR,
        message: `Cannot delete project`,
      },
    };
  }
}

export async function updateProjectAction(project: Omit<Project, 'secrets'>) {
  try {
    const updatedProject = await updateProject(project);
    revalidateProjects();
    return { success: true as const, data: updatedProject };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false as const,
        error: { code: SERVICE_ERROR.VALIDATION_FAILED, message: err.message },
      };
    }
    return {
      success: false as const,
      error: { code: SERVICE_ERROR.INTERNAL_ERROR, message: 'Failed to update project' },
    };
  }
}

// Secrets
export async function createSecretAction(projectId: string, data: Omit<Secret, 'id'>) {
  try {
    const { name, description, type, value } = data;
    const newSecret = await createSecret(projectId, { name, description, type, value });
    revalidatePath(`/projects/${projectId}`);
    return { success: true as const, data: newSecret };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false as const,
        error: { code: SERVICE_ERROR.VALIDATION_FAILED, message: err.message },
      };
    }
    return {
      success: false as const,
      error: { code: SERVICE_ERROR.INTERNAL_ERROR, message: 'Failed to create secret' },
    };
  }
}

export async function deleteSecretAction(projectId: string, secretId: string) {
  try {
    await deleteSecret(projectId, secretId);
    revalidatePath(`/projects/${projectId}`);
    return { success: true as const };
  } catch (err) {
    console.error(err);
    return {
      success: false as const,
      error: {
        code: SERVICE_ERROR.INTERNAL_ERROR,
        message: 'Cannot delete secret',
      },
    };
  }
}
