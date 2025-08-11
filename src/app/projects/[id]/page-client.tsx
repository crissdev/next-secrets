'use client';

import { PlusIcon } from 'lucide-react';
import { Suspense, useCallback, useMemo, useState } from 'react';

import AddSecretButton from '@/app/projects/[id]/add-secret-button';
import DownloadSecretsButton from '@/app/projects/[id]/download-secrets-button';
import SecretCount from '@/app/projects/[id]/secret-count';
import SecretList from '@/app/projects/[id]/secret-list';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type Secret } from '@/lib/definitions';

export default function ProjectClient(props: {
  project: { id: string; name: string };
  secretsPromise: Promise<Secret[]>;
}) {
  const [filteredSecrets, setFilteredSecrets] = useState<string[]>([]);
  const onFilterChanged = useCallback((value: Secret[]) => setFilteredSecrets(value.map((s) => s.id)), []);
  const projectInfo = useMemo(
    () => ({ id: props.project.id, name: props.project.name }),
    [props.project.id, props.project.name],
  );

  return (
    <div className={'w-full flex flex-col'}>
      <header
        className={
          'bg-white dark:bg-slate-800 py-3 px-4 border-b border-border flex items-center gap-2 sticky top-0 left-0 w-full z-10'
        }
      >
        <div className={'flex flex-col'}>
          <div className={'flex items-center'}>
            <SidebarTrigger className={'md:hidden'} />
            <h2 className={'font-bold text-xl'} data-testid={'selected-project-title'}>
              {props.project.name}
            </h2>
          </div>
          <span data-testid={'project-secrets-count'} className={'font-normal text-muted-foreground text-sm'}>
            <Suspense fallback={null}>
              <SecretCount secretsPromise={props.secretsPromise} />
            </Suspense>
          </span>
        </div>
        <div className={'ml-auto flex items-center gap-2'}>
          <DownloadSecretsButton secretIds={filteredSecrets} />
          <AddSecretButton icon={<PlusIcon size={20} />} testId={'topbar-add-secret'} />
        </div>
      </header>

      <div className={'flex-1'}>
        <SecretList projectInfo={projectInfo} secretsPromise={props.secretsPromise} onFilterChanged={onFilterChanged} />
      </div>
    </div>
  );
}
