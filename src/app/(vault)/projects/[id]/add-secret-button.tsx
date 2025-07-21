'use client';

import { useParams } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import CreateSecretDialog from '@/app/(vault)/projects/[id]/create-secret-dialog';
import { Button } from '@/components/ui/button';

export default function AddSecretButton(props: { icon?: ReactNode; testId?: string }) {
  const [createSecretDialogOpen, setCreateSecretDialogOpen] = useState(false);
  const { id: selectedProjectId } = useParams<{ id: string }>();

  return (
    <>
      <Button variant={'default'} onClick={() => setCreateSecretDialogOpen(true)} data-testid={props.testId}>
        {props.icon}
        Add secret
      </Button>
      <CreateSecretDialog
        projectId={selectedProjectId}
        open={createSecretDialogOpen}
        onClose={() => setCreateSecretDialogOpen(false)}
      />
    </>
  );
}
