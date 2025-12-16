import crypto from 'node:crypto';

import { type PrismaClient } from '@prisma/client';
import { type PrismaClientInitializationError } from '@prisma/client/runtime/edge';
import { type PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { prisma } from '@/lib/db/prisma';
import { type Project, type Secret } from '@/lib/definitions';

export async function addProject(input: Omit<Project, 'id'>) {
  return performDatabaseAction((prisma) =>
    prisma.project.create({
      data: {
        ...input,
        id: crypto.randomUUID(),
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  );
}

export async function getProjects(): Promise<Project[]> {
  return await performDatabaseAction((prisma) => prisma.project.findMany({ orderBy: { name: 'asc' } }));
}

export async function getProject(id: string): Promise<Project | null> {
  return await performDatabaseAction((prisma) =>
    prisma.project.findUnique({
      where: {
        id,
      },
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
          fields: error.meta?.target as string[] | undefined,
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
