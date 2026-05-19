'use client';

import { UploadIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import ImportSecretsDialog from '@/app/(app)/projects/[id]/import-secrets-dialog';
import { Button } from '@/components/ui/button';

export default function ImportSecretsButton() {
  const [open, setOpen] = useState(false);
  const { id: projectId } = useParams<{ id: string }>();

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <UploadIcon size={16} />
        <span className="hidden sm:inline">Import</span>
      </Button>
      <ImportSecretsDialog projectId={projectId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
