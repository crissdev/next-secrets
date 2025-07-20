import { revalidateTag, unstable_cache } from 'next/cache';
import { cache } from 'react';

import { getSecrets } from '@/lib/services/secrets.service';

import { getProject, getProjects } from './services/projects.service';

const FETCH_PROJECTS_TAG = 'projects';

// Cached functions
const cachedGetProjects = cache(getProjects);
const cachedGetSecrets = cache(getSecrets);

export const fetchProjects = unstable_cache(async () => await cachedGetProjects(), [], {
  tags: [FETCH_PROJECTS_TAG],
  revalidate: 5 * 60,
});

const cachedGetProject = cache(getProject);
export const fetchProject = unstable_cache(
  async (id: string) => {
    console.log(`Fetching project ${id}`);
    return await cachedGetProject(id);
  },
  [],
  {},
);

export function revalidateProjects() {
  revalidateTag(FETCH_PROJECTS_TAG);
}

export const fetchSecrets = unstable_cache(async (projectId: string) => cachedGetSecrets(projectId));
