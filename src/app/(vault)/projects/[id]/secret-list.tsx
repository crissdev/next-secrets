'use client';

import { LockIcon } from 'lucide-react';
import { use } from 'react';

import AddSecretButton from '@/app/(vault)/projects/[id]/add-secret-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

        <AddSecretButton testId={'empty-list-add-secret'} />
      </div>
    </div>
  ) : (
    <div className={'p-5 h-full'}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">Last updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {secrets.map((secret, index) => (
            <TableRow key={secret.id}>
              <TableCell className="font-medium">
                <div className={'flex flex-col'}>
                  <span data-testid={`secret-name-${index}`}>{secret.name}</span>
                  <span data-testid={`secret-description-${index}`} className={'text-sm text-muted-foreground'}>
                    {secret.description}
                  </span>
                </div>
              </TableCell>
              <TableCell>{secret.value.replaceAll(/./g, '•')}</TableCell>
              <TableCell className={'text-right'}>&ndash;</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
