import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useActionState, useState } from 'react';
import { useForm } from 'react-hook-form';
import type z from 'zod';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createSecretAction } from '@/lib/actions/projects.actions';
import { SECRET_TYPES } from '@/lib/definitions';
import { SERVICE_ERROR } from '@/lib/service-error-codes';
import { type createProjectSchema, createSecretSchema } from '@/lib/services/schemas';

type CreateSecretDialogProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

const SecretTypes = [
  {
    label: 'Environment Variable',
    value: SECRET_TYPES.EnvironmentVariable,
  },
];

export default function CreateSecretDialog(props: CreateSecretDialogProps) {
  const form = useForm<z.infer<typeof createSecretSchema>>({
    resolver: zodResolver(createSecretSchema),
    defaultValues: {
      name: '',
      description: '',
      value: '',
      type: SECRET_TYPES.EnvironmentVariable,
    },
  });
  const [showValue, setShowValue] = useState(true);

  const onCloseDialog = () => {
    form.reset();
    props.onClose();
  };

  const toggleValueVisibility = () => {
    setShowValue(!showValue);
  };

  const [, action, isPending] = useActionState(async () => {
    const result = await createSecretAction(props.projectId, form.getValues());

    if (result.success) {
      onCloseDialog();
      return;
    }

    if (result.error.code === SERVICE_ERROR.VALIDATION_FAILED) {
      console.log(result.error);
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
        <DialogDescription className={'sr-only'}>Add a project secret via modal</DialogDescription>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={'mb-3'}>Add new secret</DialogTitle>
          </DialogHeader>
          <form action={action} className={'flex flex-col gap-5'}>
            {form.formState.errors.root && (
              <p className={'text-destructive text-sm'}>{form.formState.errors.root?.message}</p>
            )}
            <FormField
              control={form.control}
              name={'name'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., API_KEY"
                      autoComplete={'off'}
                      aria-autocomplete={'none'}
                      data-lpignore="true"
                      name={'name'}
                    />
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
                      placeholder={'What is this secret for?'}
                      className={'min-h-20'}
                      rows={3}
                      autoComplete={'off'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'type'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={'secret-type'}>Secret type</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={(value) => field.onChange(value)} value={field.value}>
                      <SelectTrigger id={'secret-type'} className={'w-full'}>
                        <SelectValue placeholder="Select a secret type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SecretTypes.map(({ label, value }) => (
                          <SelectItem value={value} key={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'value'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret value</FormLabel>
                  <div className={'relative'}>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter secret value"
                        autoComplete={'off'}
                        aria-autocomplete={'none'}
                        data-lpignore="true"
                        name={'value'}
                        type={showValue ? 'text' : 'password'}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={toggleValueVisibility}
                    >
                      {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

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
                Add secret
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
