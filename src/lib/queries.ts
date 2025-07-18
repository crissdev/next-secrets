import { revalidateTag, unstable_cache } from 'next/cache';

import { getProjects } from './services/projects.service';

const FETCH_PROJECTS_TAG = 'projects';

export const fetchProjects = unstable_cache(async () => await getProjects(), [], {
  tags: [FETCH_PROJECTS_TAG],
  revalidate: 300, // Revalidate every 5 minutes
});

export function revalidateProjects() {
  revalidateTag(FETCH_PROJECTS_TAG);
}
