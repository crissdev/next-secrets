import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import PageClient from '@/app/(app)/projects/[id]/page-client';
import { fetchProject, fetchSecrets } from '@/lib/queries';
import { requireSession } from '@/lib/session';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ProjectPageContent params={params} />
    </Suspense>
  );
}

async function ProjectPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireSession();
  const project = await fetchProject(id, user.id);

  if (!project) {
    notFound();
  }

  const secretsPromise = fetchSecrets(project.id);

  return <PageClient project={{ id: project.id, name: project.name }} secretsPromise={secretsPromise} />;
}
