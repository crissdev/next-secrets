'use client';

import { DownloadIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { downloadSecretsAction } from '@/lib/actions';

export default function DownloadSecretsButton(props: { secretIds?: string[] }) {
  const { id: selectedProjectId } = useParams<{ id: string }>();
  const [isPending, startTransition] = useTransition();

  const onDownloadSecrets = () => {
    startTransition(async () => {
      const result = await downloadSecretsAction(selectedProjectId, props.secretIds);

      if (!result.success) {
        console.error('Failed to download secrets:', result.error);
        return;
      }

      const envData = result.data.reduce((acc, item) => acc + `${item.name}="${item.value}"\n`, '');

      const blob = new Blob([envData], {
        type: 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'secrets.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('Secrets downloaded successfully');
    });
  };

  return (
    <Button variant={'outline'} onClick={onDownloadSecrets} disabled={isPending}>
      <DownloadIcon />
      <span>Download secrets</span>
    </Button>
  );
}
