'use client';

import { LockIcon, Search } from 'lucide-react';
import { use, useState } from 'react';

import SecretsTable from '@/app/(vault)/projects/[id]/secrets-table';
import AddSecretButton from '@/app/(vault)/projects/add-secret-button';
import { Input } from '@/components/ui/input';
import { type Secret } from '@/lib/definitions';

export default function SecretList(props: { secretsPromise: Promise<Secret[]>; projectName?: string }) {
  const secrets = use(props.secretsPromise);
  const [filter, setFilter] = useState('');

  return secrets.length === 0 ? (
    <div className={'h-full flex items-center'}>
      <div className="max-w-md text-center mx-auto">
        <div className={'rounded-full bg-muted mb-6 p-6 flex items-center justify-center w-min mx-auto'}>
          <LockIcon size={48} className={'stroke-muted-foreground'} />
        </div>

        <h2 className={'text-xl font-bold mb-3'} data-testid="no-secrets-message">
          No secrets yet
        </h2>

        <div className={'text-muted-foreground mb-5'} data-testid="no-secrets-hint">
          Add your first secret to the &#34;{props.projectName}&#34; project.
        </div>

        <AddSecretButton testId={'empty-list-add-secret'} />
      </div>
    </div>
  ) : (
    <div className={'p-5 h-full'}>
      <div className={'relative  mb-4'}>
        <div className={'absolute left-2 top-1/2 -translate-y-1/2'}>
          <Search size={18} className={'stroke-muted-foreground'} />
        </div>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search secrets..."
          className="bg-white w-[32ch] pl-8"
        />
      </div>
      <SecretsTable data={secrets} filter={filter} />
    </div>
  );
}
