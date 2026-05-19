import { cacheLife, cacheTag, updateTag } from 'next/cache';
import { cache } from 'react';

import { getSecrets } from '@/lib/services/secrets.service';

import { getProject, getProjects } from './services/projects.service';

const FETCH_PROJECTS_TAG = 'projects';

// React cache for deduplication within a request
const cachedGetSecrets = cache(getSecrets);

export async function fetchProjects(userId: string) {
  'use cache';
  cacheTag(`${FETCH_PROJECTS_TAG}-${userId}`);
  cacheLife('minutes');
  return getProjects(userId);
}

export async function fetchProject(id: string, userId: string) {
  'use cache';
  cacheTag(`project-${id}`);
  cacheLife('minutes');
  return getProject(id, userId);
}

export function revalidateProjects(userId: string) {
  updateTag(`${FETCH_PROJECTS_TAG}-${userId}`);
}

export function revalidateProject(projectId: string) {
  updateTag(`project-${projectId}`);
}

export function revalidateSecrets(projectId: string) {
  updateTag(`secrets-${projectId}`);
}

export async function fetchSecrets(projectId: string) {
  'use cache';
  cacheTag(`secrets-${projectId}`);
  cacheLife('minutes');
  return cachedGetSecrets(projectId);
}
