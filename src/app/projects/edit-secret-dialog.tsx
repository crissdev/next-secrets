import { zodResolver } from '@hookform/resolvers/zod';
import { SecretType } from '@prisma/client';
import { Eye, EyeOff } from 'lucide-react';
import { startTransition, useActionState, useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createSecretAction, updateSecretAction, updateSecretValueAction } from '@/lib/actions';
import { DEFAULT_ENVIRONMENTS, type Secret } from '@/lib/definitions';
import { SERVICE_ERROR } from '@/lib/service-error-codes';
import { createSecretSchema } from '@/lib/services/schemas';

type EditSecretDialogProps = {
  projectId: string;
  secret?: Secret;
  open: boolean;
  onClose: () => void;
};

const SecretTypes = [
  { label: 'API Key', value: SecretType.API_KEY },
  { label: 'Connection String', value: SecretType.CONNECTION_STRING },
  { label: 'Environment Variable', value: SecretType.ENVIRONMENT_VARIABLE },
  { label: 'Password', value: SecretType.PASSWORD },
  { label: 'Token', value: SecretType.TOKEN },
  { label: 'Other', value: SecretType.OTHER },
];

export default function EditSecretDialog(props: EditSecretDialogProps) {
  const [valueFieldVisible, setValueFieldVisible] = useState(!props.secret);
  const form = useForm<z.infer<typeof createSecretSchema>>({
    resolver: zodResolver(createSecretSchema),
    defaultValues: {
      name: '',
      description: '',
      value: '',
      type: SecretType.ENVIRONMENT_VARIABLE,
      environmentId: DEFAULT_ENVIRONMENTS[0].id,
    },
  });
  const [showValue, setShowValue] = useState(true);
  const idPrefix = useId();

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
        environmentId: props.secret.environmentId,
      });
    }
  }, [form, props.secret]);

  const handleActionError = (error: { code: SERVICE_ERROR; message: string }) => {
    if (error.code === SERVICE_ERROR.VALIDATION_FAILED) {
      console.log(error);
      // If the error is a ZodError, we can extract the first error message
      const firstError = JSON.parse(error.message)[0];
      form.setError(firstError.path[0] as keyof z.infer<typeof createSecretSchema>, {
        message: firstError.message,
      });
    } else {
      // For other errors, we can set a generic error message
      form.setError('root', {
        message: error.message || 'An unexpected error occurred. Please try again.',
      });
    }
  };

  const [, action, isPending] = useActionState(async () => {
    const secretName = form.getValues().name;
    const formValues = form.getValues();

    const result = props.secret
      ? await updateSecretAction(props.projectId, { ...formValues, id: props.secret.id })
      : await createSecretAction(props.projectId, { ...formValues });

    if (!result.success) {
      handleActionError(result.error);
      return;
    }

    if (result.success) {
      if (props.secret && valueFieldVisible) {
        const updateSecretResult = await updateSecretValueAction(props.projectId, props.secret.id, formValues.value);
        if (!updateSecretResult.success) {
          handleActionError(updateSecretResult.error);
          return;
        }
      }
      onCloseDialog();
      startTransition(() => {
        toast.success(props.secret ? 'Secret updated' : 'Secret created', {
          description: `"${secretName}" has been ${props.secret ? 'updated' : 'created'} successfully.`,
          position: 'bottom-right',
        });
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
              name={'environmentId'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`${idPrefix}-secret-environment-id`}>Environment</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={(value) => field.onChange(value)} value={field.value}>
                      <SelectTrigger id={`${idPrefix}-secret-environment-id`} className={'w-full'}>
                        <SelectValue placeholder="Select an envrionment this secret is defined for" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_ENVIRONMENTS.map(({ id, name }) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              {props.secret && (
                <div className="flex items-center gap-2 mb-3">
                  <Switch
                    id={`${idPrefix}-show-secret`}
                    checked={valueFieldVisible}
                    onCheckedChange={(checked) => setValueFieldVisible(checked)}
                  />
                  <Label htmlFor={`${idPrefix}-show-secret`}>Update secret value</Label>
                </div>
              )}
              <FormField
                control={form.control}
                name={'value'}
                render={({ field }) =>
                  valueFieldVisible ? (
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
                  ) : (
                    <></>
                  )
                }
              />
            </div>
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
