'use client';

import { LockIcon } from 'lucide-react';
import { use } from 'react';

import { Button } from '@/components/ui/button';
import { type Secret } from '@/lib/definitions';

export default function SecretList(props: { secretsPromise: Promise<Secret[]>; projectName?: string }) {
  const secrets = use(props.secretsPromise);

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

        <Button variant={'default'}>Add secret</Button>
      </div>

      <p></p>
    </div>
  ) : null;
}
