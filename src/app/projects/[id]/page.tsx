import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import PageClient from '@/app/projects/[id]/page-client';
import { fetchProject, fetchSecrets } from '@/lib/queries';

export default function ProjectPage(props: PageProps<'/projects/[id]'>) {
  return (
    <Suspense>
      <ProjectPageContent params={props.params} />
    </Suspense>
  );
}

async function ProjectPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await fetchProject(id);

  if (!project) {
    notFound();
  }

  const secretsPromise = fetchSecrets(project.id);

  return <PageClient project={{ id: project.id, name: project.name }} secretsPromise={secretsPromise} />;
}
