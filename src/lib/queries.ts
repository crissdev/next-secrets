import { revalidateTag, unstable_cache } from 'next/cache';
import { cache } from 'react';

import { getProjects } from './services/projects.service';

const FETCH_PROJECTS_TAG = 'projects';

// Cached functions
const cachedGetProjects = cache(getProjects);

export const fetchProjects = unstable_cache(async () => await cachedGetProjects(), [], {
  tags: [FETCH_PROJECTS_TAG],
  revalidate: 5 * 60,
});

export function revalidateProjects() {
  revalidateTag(FETCH_PROJECTS_TAG);
}
