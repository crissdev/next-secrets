'use server';

import { refresh, revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

import type { Project, Secret } from '@/lib/definitions';
import { revalidateProject, revalidateProjects, revalidateSecrets } from '@/lib/queries';
import { SERVICE_ERROR } from '@/lib/service-error-codes';
import { createProject, deleteProject, updateProject } from '@/lib/services/projects.service';
import { createSecret, downloadSecrets, getSecretValue, updateSecret } from '@/lib/services/secrets.service';
import { requireSession } from '@/lib/session';
import { deleteSecret, importSecrets, updateSecretValue } from '@/lib/store/storage';

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
    const { user } = await requireSession();
    const { name, description, color } = data;
    const newProject = await createProject({ name, description, color }, user.id);
    revalidateProjects(user.id);
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
    const { user } = await requireSession();
    await deleteProject(projectId);
    revalidateProjects(user.id);
    revalidatePath(`/projects/${projectId}`);
    refresh();
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
    const { user } = await requireSession();
    const updatedProject = await updateProject(project);
    revalidateProjects(user.id);
    revalidateProject(project.id);
    refresh();
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
  data: Omit<Secret, 'id' | 'updatedAt' | 'projectId'>,
): Promise<ActionSuccessResult<Secret> | ActionErrorResult> {
  try {
    const { name, description, type, environmentId, value } = data;
    const newSecret = await createSecret(projectId, { name, description, type, environmentId, value });
    revalidateSecrets(projectId);
    revalidatePath(`/projects/${projectId}`);
    refresh();
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
    await deleteSecret(secretId);
    revalidateSecrets(projectId);
    revalidatePath(`/projects/${projectId}`);
    refresh();
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
  secret: Omit<Secret, 'updatedAt' | 'value' | 'projectId'>,
): Promise<ActionSuccessResult<Secret> | ActionErrorResult> {
  try {
    const updatedSecret = await updateSecret(secret);
    revalidateSecrets(projectId);
    revalidatePath(`/projects/${projectId}`);
    refresh();
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
    await updateSecretValue(secretId, value);
    revalidateSecrets(projectId);
    revalidatePath(`/projects/${projectId}`);
    refresh();
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

export async function getSecretValueAction(secretId: string): Promise<ActionSuccessResult<string> | ActionErrorResult> {
  try {
    const secretValue = await getSecretValue(secretId);
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

export async function importSecretsAction(
  projectId: string,
  entries: Array<{ name: string; value: string }>,
  environmentId: string,
  mode: 'skip' | 'overwrite',
): Promise<ActionSuccessResult<{ imported: number; skipped: number }> | ActionErrorResult> {
  try {
    const result = await importSecrets(
      projectId,
      entries.map((e) => ({ ...e, environmentId })),
      mode,
    );
    revalidateSecrets(projectId);
    refresh();
    return { success: true as const, data: result };
  } catch (err) {
    console.error(err);
    return {
      success: false as const,
      error: { code: SERVICE_ERROR.INTERNAL_ERROR, message: 'Failed to import secrets' },
    };
  }
}

export async function downloadSecretsAction(
  projectId: string,
  secretIds?: string[],
): Promise<ActionSuccessResult<{ name: string; value: string }[]> | ActionErrorResult> {
  try {
    const secrets = await downloadSecrets(projectId, secretIds);
    return { success: true as const, data: secrets };
  } catch (err) {
    console.error(err);
    return {
      success: false as const,
      error: {
        code: SERVICE_ERROR.INTERNAL_ERROR,
        message: 'Cannot download secrets',
      },
    };
  }
}
