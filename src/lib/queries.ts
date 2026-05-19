import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
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
  revalidateTag(`${FETCH_PROJECTS_TAG}-${userId}`, 'max');
}

export async function fetchSecrets(projectId: string) {
  'use cache';
  cacheTag(`secrets-${projectId}`);
  cacheLife('minutes');
  return cachedGetSecrets(projectId);
}
