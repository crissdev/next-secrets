'use client';

import { LockIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { use, useState } from 'react';

import CreateSecretDialog from '@/app/(vault)/projects/[id]/create-secret-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Secret } from '@/lib/definitions';

export default function SecretList(props: { secretsPromise: Promise<Secret[]>; projectName?: string }) {
  const secrets = use(props.secretsPromise);
  const [createSecretDialogOpen, setCreateSecretDialogOpen] = useState(false);
  const { id: selectedProjectId } = useParams<{ id: string }>();

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

        <Button variant={'default'} onClick={() => setCreateSecretDialogOpen(true)}>
          Add secret
        </Button>

        <CreateSecretDialog
          projectId={selectedProjectId}
          open={createSecretDialogOpen}
          onClose={() => setCreateSecretDialogOpen(false)}
        />
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
          {secrets.map((secret) => (
            <TableRow key={secret.id}>
              <TableCell className="font-medium">
                <div className={'flex flex-col'}>
                  <span>{secret.name}</span>
                  <span className={'text-sm text-muted-foreground'}>{secret.description}</span>
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
