import crypto from 'node:crypto';

import { prisma } from '@/lib/db/prisma';
import { type PrismaClient } from '@/lib/db/prisma';
import {
  type PrismaClientInitializationError,
  type PrismaClientKnownRequestError,
} from '@/lib/db/prisma-client/postgresql/internal/prismaNamespace';
import { DEFAULT_ENVIRONMENTS, type Project, type Secret } from '@/lib/definitions';

export async function addProject(input: Omit<Project, 'id'>, userId: string) {
  return performDatabaseAction((prisma) =>
    prisma.project.create({
      data: {
        ...input,
        id: crypto.randomUUID(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  );
}

export async function getProjects(userId: string): Promise<Project[]> {
  return await performDatabaseAction((prisma) =>
    prisma.project.findMany({ where: { userId }, orderBy: { name: 'asc' } }),
  );
}

export async function getProject(id: string, userId: string): Promise<Project | null> {
  return await performDatabaseAction((prisma) =>
    prisma.project.findUnique({
      where: { id, userId },
    }),
  );
}

export async function deleteProject(id: string): Promise<void> {
  await performDatabaseAction(async (prisma) => {
    await prisma.project.delete({
      where: {
        id,
      },
    });
  });
}

export async function updateProject(id: string, input: Omit<Project, 'id' | 'secrets'>) {
  return await performDatabaseAction((prisma) =>
    prisma.project.update({
      where: {
        id,
      },
      data: {
        // Update each field individually
        name: input.name,
        description: input.description,
        color: input.color,
        updatedAt: new Date(),
      },
    }),
  );
}

export async function ensureDefaultEnvironments(): Promise<void> {
  await performDatabaseAction(async (prisma) => {
    for (const env of DEFAULT_ENVIRONMENTS) {
      await prisma.environment.upsert({
        where: { name: env.name },
        update: {
          id: env.id,
          description: '',
        },
        create: {
          id: env.id,
          name: env.name,
          description: '',
        },
      });
    }
  });
}

export async function createSecret(input: Omit<Secret, 'id' | 'updatedAt'>): Promise<Secret> {
  return await performDatabaseAction((prisma) =>
    prisma.secret.create({
      data: {
        ...input,
      },
    }),
  );
}

export async function getSecrets(projectId: string): Promise<Secret[]> {
  return await performDatabaseAction((prisma) =>
    prisma.secret.findMany({
      where: {
        projectId,
      },
    }),
  );
}

export async function getSecretValue(secretId: string) {
  return await performDatabaseAction(async (prisma) => {
    const { value } = await prisma.secret.findUniqueOrThrow({
      where: {
        id: secretId,
      },
      select: {
        value: true,
      },
    });
    return value;
  });
}

export async function deleteSecret(secretId: string): Promise<void> {
  await performDatabaseAction(async (prisma) => {
    await prisma.secret.delete({
      where: {
        id: secretId,
      },
    });
  });
}

export async function updateSecret(secret: Omit<Secret, 'updatedAt' | 'value' | 'projectId'>) {
  return await performDatabaseAction((prisma) =>
    prisma.secret.update({
      where: {
        id: secret.id,
      },
      data: {
        name: secret.name,
        description: secret.description,
        type: secret.type,
        environmentId: secret.environmentId,
        updatedAt: new Date(),
      },
    }),
  );
}

export async function updateSecretValue(secretId: string, secretValue: string): Promise<void> {
  await performDatabaseAction(async (prisma) => {
    await prisma.secret.update({
      where: {
        id: secretId,
      },
      data: {
        value: secretValue,
        updatedAt: new Date(),
      },
    });
  });
}

export async function upsertSecret(input: Omit<Secret, 'id' | 'updatedAt'>): Promise<{ created: boolean }> {
  return await performDatabaseAction(async (prisma) => {
    const existing = await prisma.secret.findFirst({
      where: { name: input.name, projectId: input.projectId, environmentId: input.environmentId },
      select: { id: true },
    });
    if (existing) {
      await prisma.secret.update({
        where: { id: existing.id },
        data: { value: input.value, type: input.type },
      });
      return { created: false };
    }
    await prisma.secret.create({ data: input });
    return { created: true };
  });
}

// Helper function to handle database errors
async function performDatabaseAction<T = unknown>(action: (client: PrismaClient) => Promise<T>) {
  try {
    return await action(prisma);
  } catch (error) {
    console.error('Error in Prisma ORM data handling:', error);

    if (isPrismaClientInitializationError(error)) {
      if (error.message.includes("Can't reach database server")) {
        throw new DatabaseConnectionError(error.message, { cause: error });
      }
    }
    if (isPrismaClientKnownRequestError(error)) {
      if (error.code === 'P2002')
        throw new UniqueConstraintError(error.message, {
          cause: error,
          fields: (error.meta?.driverAdapterError as { cause?: { constraint?: { fields?: string[] } } } | undefined)
            ?.cause?.constraint?.fields,
        });
    }
    throw new DatabaseError('A database error occurred', { cause: error as Error });
  }
}

// Custom error classes for database operations
export class DatabaseError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = 'DataAccessError';
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = 'DatabaseConnectionError';
  }
}

export class UniqueConstraintError extends DatabaseError {
  public readonly fields: string[];

  constructor(message: string, options?: { fields?: string[]; cause?: Error }) {
    super(message, options);
    this.name = 'UniqueConstraintError';
    this.fields = options?.fields ?? [];
  }
}

// Type guards for error types
function isPrismaClientInitializationError(error: unknown): error is PrismaClientInitializationError {
  return error instanceof Error && error.name === 'PrismaClientInitializationError';
}

function isPrismaClientKnownRequestError(error: unknown): error is PrismaClientKnownRequestError {
  return error instanceof Error && error.name === 'PrismaClientKnownRequestError';
}
