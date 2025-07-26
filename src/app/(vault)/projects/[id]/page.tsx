import { PlusIcon } from 'lucide-react';
import { redirect, RedirectType } from 'next/navigation';
import { Suspense } from 'react';

import SecretCount from '@/app/(vault)/projects/[id]/secret-count';
import SecretList from '@/app/(vault)/projects/[id]/secret-list';
import AddSecretButton from '@/app/(vault)/projects/add-secret-button';
import { fetchProject, fetchSecrets } from '@/lib/queries';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await fetchProject(params.id);

  if (!project) {
    redirect('/404', RedirectType.replace);
  }

  const secretsPromise = fetchSecrets(project.id);

  return (
    <div className={'w-full flex flex-col'}>
      <header
        className={
          'bg-white dark:bg-slate-800 py-3 px-4 border-b border-border flex items-center gap-2 sticky top-0 left-0 w-full z-10'
        }
      >
        <div className={'flex flex-col'}>
          <h2 className={'font-bold text-xl'} data-testid={'selected-project-title'}>
            {project?.name}
          </h2>
          <span data-testid={'project-secrets-count'} className={'font-normal text-muted-foreground text-sm'}>
            <Suspense fallback={null}>
              <SecretCount secretsPromise={secretsPromise} />
            </Suspense>
          </span>
        </div>
        <div className={'ml-auto'}>
          <AddSecretButton icon={<PlusIcon size={20} />} testId={'topbar-add-secret'} />
        </div>
      </header>

      <div className={'flex-1'}>
        <SecretList projectName={project?.name} secretsPromise={secretsPromise} />
      </div>
    </div>
  );
}
