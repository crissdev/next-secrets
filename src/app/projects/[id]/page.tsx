import { notFound } from 'next/navigation';

import PageClient from '@/app/projects/[id]/page-client';
import { fetchProject, fetchSecrets } from '@/lib/queries';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function ProjectPage(props: PageProps<'/projects/[id]'>) {
  const params = await props.params;
  const project = await fetchProject(params.id);

  if (!project) {
    notFound();
  }

  const secretsPromise = fetchSecrets(project.id);

  return <PageClient project={{ id: project.id, name: project.name }} secretsPromise={secretsPromise} />;
}
