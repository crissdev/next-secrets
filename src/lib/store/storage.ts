import crypto from 'node:crypto';

import { getPrismaClient } from '@/lib/db/prisma';
import { type Project, type Secret } from '@/lib/definitions';

export async function addProject(input: Omit<Project, 'id'>) {
  const prisma = getPrismaClient();
  return await prisma.project.create({
    data: {
      ...input,
      id: crypto.randomUUID(),
      userId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getProjects(): Promise<Project[]> {
  const prisma = getPrismaClient();
  return await prisma.project.findMany();
}

export async function getProject(id: string): Promise<Project | null> {
  const prisma = getPrismaClient();
  return await prisma.project.findUnique({
    where: {
      id,
    },
  });
}

export async function deleteProject(id: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.project.delete({
    where: {
      id,
    },
  });
}

export async function updateProject(id: string, input: Omit<Project, 'id' | 'secrets'>) {
  const prisma = getPrismaClient();
  return await prisma.project.update({
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
  });
}

export async function createSecret(input: Omit<Secret, 'id' | 'updatedAt'>): Promise<Secret> {
  const prisma = getPrismaClient();
  return await prisma.secret.create({
    data: {
      ...input,
    },
  });
}

export async function getSecrets(projectId: string): Promise<Secret[]> {
  const prisma = getPrismaClient();
  return await prisma.secret.findMany({
    where: {
      projectId,
    },
  });
}

export async function getSecretValue(secretId: string) {
  const prisma = getPrismaClient();
  const { value } = await prisma.secret.findUniqueOrThrow({
    where: {
      id: secretId,
    },
    select: {
      value: true,
    },
  });
  return value;
}

export async function deleteSecret(secretId: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.secret.delete({
    where: {
      id: secretId,
    },
  });
}

export async function updateSecret(secret: Omit<Secret, 'updatedAt' | 'value' | 'projectId'>) {
  const prisma = getPrismaClient();
  return await prisma.secret.update({
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
  });
}

export async function updateSecretValue(secretId: string, secretValue: string): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.secret.update({
    where: {
      id: secretId,
    },
    data: {
      value: secretValue,
      updatedAt: new Date(),
    },
  });
}
