'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import type { Project, Secret } from '@/lib/definitions';
import { revalidateProjects } from '@/lib/queries';
import { SERVICE_ERROR } from '@/lib/service-error-codes';
import { createProject, deleteProject, updateProject } from '@/lib/services/projects.service';
import { createSecret, getSecretValue, updateSecret } from '@/lib/services/secrets.service';
import { deleteSecret, updateSecretValue } from '@/lib/store/db';

export type ActionErrorResult = {
  success: false;
  error: {
    code: SERVICE_ERROR;
    message: string;
  };
};

export type ActionSuccessResult<T = unknown> = {
  success: true;
  data: T;
};

export type ActionSuccessResultVoid = {
  success: true;
};

// Projects
export async function createProjectAction(
  data: Omit<Project, 'id'>,
): Promise<ActionSuccessResult<Project> | ActionErrorResult> {
  try {
    const { name, description, color } = data;
    const newProject = await createProject({ name, description, color });
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

export async function deleteProjectAction(projectId: string): Promise<ActionSuccessResultVoid | ActionErrorResult> {
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

export async function updateProjectAction(
  project: Omit<Project, 'secrets'>,
): Promise<ActionSuccessResult<Project> | ActionErrorResult> {
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
export async function createSecretAction(
  projectId: string,
  data: Omit<Secret, 'id' | 'lastUpdated'>,
): Promise<ActionSuccessResult<Secret> | ActionErrorResult> {
  try {
    const { name, description, type, environmentId, value } = data;
    const newSecret = await createSecret(projectId, { name, description, type, environmentId, value });
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

export async function deleteSecretAction(
  projectId: string,
  secretId: string,
): Promise<ActionSuccessResultVoid | ActionErrorResult> {
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

export async function updateSecretAction(
  projectId: string,
  secret: Omit<Secret, 'lastUpdated' | 'value'>,
): Promise<ActionSuccessResult<Secret> | ActionErrorResult> {
  try {
    const updatedSecret = await updateSecret(projectId, secret);
    revalidatePath(`/projects/${projectId}`);
    return { success: true as const, data: updatedSecret };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false as const,
        error: { code: SERVICE_ERROR.VALIDATION_FAILED, message: err.message },
      };
    }
    return {
      success: false as const,
      error: { code: SERVICE_ERROR.INTERNAL_ERROR, message: 'Failed to update secret' },
    };
  }
}

export async function updateSecretValueAction(
  projectId: string,
  secretId: string,
  value: string,
): Promise<ActionSuccessResultVoid | ActionErrorResult> {
  try {
    await updateSecretValue(projectId, secretId, value);
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false,
        error: { code: SERVICE_ERROR.VALIDATION_FAILED, message: err.message },
      };
    }
    return {
      success: false,
      error: { code: SERVICE_ERROR.INTERNAL_ERROR, message: 'Failed to update secret value' },
    };
  }
}

export async function getSecretValueAction(
  projectId: string,
  secretId: string,
): Promise<ActionSuccessResult<string> | ActionErrorResult> {
  try {
    const secretValue = await getSecretValue(projectId, secretId);
    return { success: true as const, data: secretValue };
  } catch (err) {
    console.error(err);
    return {
      success: false as const,
      error: {
        code: SERVICE_ERROR.INTERNAL_ERROR,
        message: 'Cannot get secret value',
      },
    };
  }
}
