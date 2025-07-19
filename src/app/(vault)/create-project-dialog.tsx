import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createProjectAction } from '@/lib/actions/projects.actions';
import { createProjectSchema } from '@/lib/services/schemas';

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateProjectDialog(props: CreateProjectDialogProps) {
  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  const router = useRouter();

  const onCloseDialog = () => {
    form.reset();
    props.onClose();
  };

  const [, action, isPending] = useActionState(async () => {
    const result = await createProjectAction(form.getValues());

    if (result.success) {
      onCloseDialog();
      router.push(`/projects/${result.data.id}`);
      return;
    }

    if (result.error.name === 'ZodError') {
      // If the error is a ZodError, we can extract the first error message
      const firstError = JSON.parse(result.error.message)[0];
      form.setError(firstError.path[0] as keyof z.infer<typeof createProjectSchema>, {
        message: firstError.message,
      });
    } else {
      // For other errors, we can set a generic error message
      form.setError('root', {
        message: result.error.message || 'An unexpected error occurred. Please try again.',
      });
    }
  }, undefined);

  return (
    <Form {...form}>
      <Dialog open={props.open} onOpenChange={(open) => !open && onCloseDialog()}>
        <DialogDescription className={'sr-only'}>Create a project via a dialog</DialogDescription>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={'mb-3'}>Create new project</DialogTitle>
          </DialogHeader>
          <form action={action} id={'form'} className={'flex flex-col gap-5'}>
            {form.formState.errors.root && (
              <p className={'text-destructive text-sm'}>{form.formState.errors.root?.message}</p>
            )}
            <FormField
              control={form.control}
              name={'name'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., API Tokens" autoComplete={'off'} name={'name'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name={'description'}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      name={'description'}
                      placeholder={'What is this project for?'}
                      className={'min-h-20'}
                      rows={3}
                      autoComplete={'off'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={onCloseDialog} disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
