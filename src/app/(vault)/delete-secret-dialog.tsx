import { startTransition, useActionState, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteSecretAction } from '@/lib/actions/projects.actions';

type DeleteSecretDialogProps = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  secretId: string;
  secretName: string;
};

export default function DeleteSecretDialog(props: DeleteSecretDialogProps) {
  const [error, setError] = useState<string>('');
  const onCloseDialog = () => {
    props.onClose();
  };

  const [, action, isPending] = useActionState(async () => {
    const result = await deleteSecretAction(props.projectId, props.secretId);
    if (result.success) {
      onCloseDialog();
      startTransition(() => {
        toast.message('Secret deleted', {
          description: `"${props.secretName}" has been deleted successfully.`,
          position: 'bottom-right',
        });
      });
      setError('');
    } else {
      setError(result.error.message);
    }
  }, undefined);

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && onCloseDialog()}>
      <DialogDescription>Delete a project secret via dialog</DialogDescription>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={'mb-3'}>Delete secret</DialogTitle>
        </DialogHeader>

        {error && <p className={'text-destructive'}>{error}</p>}
        <p data-testid={'warning-message'}>
          Are you sure you want to delete &#34;<span>{props.secretName}</span>&#34;? This action cannot be undone.
        </p>

        <form action={action}>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={onCloseDialog} disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} variant="destructive">
              Delete secret
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
