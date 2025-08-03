import { useParams, useRouter } from 'next/navigation';
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
import { deleteProjectAction } from '@/lib/actions';

type DeleteProjectDialogProps = {
  projectId: string;
  projectName: string;
  open: boolean;
  onClose: () => void;
};

export default function DeleteProjectDialog(props: DeleteProjectDialogProps) {
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { id: selectedProjectId } = useParams<{ id?: string }>();

  const onCloseDialog = () => {
    props.onClose();
  };

  const [, action, isPending] = useActionState(async () => {
    const result = await deleteProjectAction(props.projectId);
    if (result.success) {
      onCloseDialog();
      startTransition(() => {
        toast.message('Project deleted', {
          description: `"${props.projectName}" has been deleted successfully.`,
          position: 'bottom-right',
        });
      });
      if (selectedProjectId) {
        router.replace('/');
      } else {
        router.push('/');
      }
      setError('');
    } else {
      setError(result.error.message);
    }
  }, undefined);

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && onCloseDialog()}>
      <DialogDescription className={'sr-only'}>Delete a project via modal</DialogDescription>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={'mb-3'}>Delete project</DialogTitle>
        </DialogHeader>

        {error && <p className={'text-destructive'}>{error}</p>}
        <p data-testid={'warning-message'}>
          Are you sure you want to delete &#34;<span>{props.projectName}</span>&#34;? This action cannot be undone and
          will delete all secrets within this project.
        </p>

        <form action={action}>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={onCloseDialog} disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} variant="destructive">
              Delete project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
