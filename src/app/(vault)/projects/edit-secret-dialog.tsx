import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { createSecretAction, updateSecretAction } from '@/lib/actions/projects.actions';
import { type Secret, SECRET_TYPE } from '@/lib/definitions';
import { SERVICE_ERROR } from '@/lib/service-error-codes';
import { createSecretSchema } from '@/lib/services/schemas';

type EditSecretDialogProps = {
  projectId: string;
  secret?: Secret;
  open: boolean;
  onClose: () => void;
};

const SecretTypes = [
  { label: 'API Key', value: SECRET_TYPE.ApiKey },
  { label: 'Connection String', value: SECRET_TYPE.ConnectionString },
  { label: 'Environment Variable', value: SECRET_TYPE.EnvironmentVariable },
  { label: 'Password', value: SECRET_TYPE.Password },
  { label: 'Token', value: SECRET_TYPE.Token },
  { label: 'Other', value: SECRET_TYPE.Other },
];

export default function EditSecretDialog(props: EditSecretDialogProps) {
  const form = useForm<z.infer<typeof createSecretSchema>>({
    resolver: zodResolver(createSecretSchema),
    defaultValues: {
      name: '',
      description: '',
      value: '',
      type: SECRET_TYPE.EnvironmentVariable,
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

  useEffect(() => {
    if (props.secret) {
      form.reset({
        name: props.secret.name,
        description: props.secret.description,
        type: props.secret.type,
        value: props.secret.value,
      });
    }
  }, [form, props.secret]);

  const [, action, isPending] = useActionState(async () => {
    const secretName = form.getValues().name;
    const result = props.secret
      ? await updateSecretAction(props.projectId, { id: props.secret.id, ...form.getValues() })
      : await createSecretAction(props.projectId, form.getValues());

    if (result.success) {
      onCloseDialog();
      startTransition(() => {
        toast.success(props.secret ? 'Secret updated' : 'Secret created', {
          description: `"${secretName}" has been ${props.secret ? 'updated' : 'created'} successfully.`,
          position: 'bottom-right',
        });
      });
      return;
    }

    if (result.error.code === SERVICE_ERROR.VALIDATION_FAILED) {
      console.log(result.error);
      // If the error is a ZodError, we can extract the first error message
      const firstError = JSON.parse(result.error.message)[0];
      form.setError(firstError.path[0] as keyof z.infer<typeof createSecretSchema>, {
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
        <DialogDescription className={'sr-only'}>
          {props.secret ? 'Edit a project secret via modal' : 'Add a project secret via modal'}
        </DialogDescription>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={'mb-3'}>{props.secret ? 'Edit secret' : 'Add new secret'}</DialogTitle>
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
                {props.secret ? 'Update secret' : 'Add secret'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
