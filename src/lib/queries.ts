import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { cache } from 'react';

import { getSecrets } from '@/lib/services/secrets.service';

import { getProject, getProjects } from './services/projects.service';

const FETCH_PROJECTS_TAG = 'projects';

// React cache for deduplication within a request
const cachedGetProject = cache(getProject);
const cachedGetSecrets = cache(getSecrets);

export async function fetchProjects() {
  'use cache';
  cacheTag(FETCH_PROJECTS_TAG);
  cacheLife('minutes');
  return getProjects();
}

export const fetchProject = async (id: string) => await cachedGetProject(id);

export function revalidateProjects() {
  revalidateTag(FETCH_PROJECTS_TAG, 'max');
}

export async function fetchSecrets(projectId: string) {
  'use cache';
  cacheTag(`secrets-${projectId}`);
  cacheLife('minutes');
  return cachedGetSecrets(projectId);
}
