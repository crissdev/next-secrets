'use client';

import { CheckCircle2Icon, Loader2Icon, UploadIcon, XCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { importSecretsAction } from '@/lib/actions';
import { SecretGroup } from '@/lib/db/prisma-client/enums';
import { DEFAULT_ENVIRONMENTS, DEFAULT_SECRET_GROUPS } from '@/lib/definitions';
import { parseEnvFile } from '@/lib/env-parser';

interface ImportResult {
  imported: number;
  skipped: number;
}

export default function ImportSecretsDialog({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [environmentId, setEnvironmentId] = useState(DEFAULT_ENVIRONMENTS[0].id);
  const [group, setGroup] = useState<SecretGroup>(SecretGroup.RUNTIME_APPLICATION);
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = parseEnvFile(content);

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(env|txt)$/) && !file.name.startsWith('.env')) {
      setError('Please select a .env file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setContent((e.target?.result as string) ?? '');
    reader.readAsText(file);
    setError('');
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setLoading(true);
    setError('');
    const res = await importSecretsAction(
      projectId,
      parsed.map((e) => ({ name: e.key, value: e.value })),
      environmentId,
      group,
      overwrite ? 'overwrite' : 'skip',
    );
    setLoading(false);
    if (res.success) {
      setResult(res.data);
      setContent('');
    } else {
      setError(res.error.message);
    }
  };

  const handleClose = () => {
    const hadResult = !!result;
    setContent('');
    setResult(null);
    setError('');
    setLoading(false);
    onClose();
    if (hadResult) router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from .env</DialogTitle>
          {!result && (
            <DialogDescription>
              Upload a <code className="font-mono text-xs">.env</code> file or paste its contents below.
            </DialogDescription>
          )}
        </DialogHeader>

        {result ? (
          <div className="py-4 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2Icon size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium">Import complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-foreground font-medium">{result.imported}</span> secret
                {result.imported !== 1 ? 's' : ''} imported
                {result.skipped > 0 && (
                  <>
                    , <span className="text-foreground font-medium">{result.skipped}</span> skipped
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-hidden">
            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <UploadIcon size={20} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop a <code className="font-mono text-xs">.env</code> file here or{' '}
                <span className="text-primary font-medium">browse</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".env,.txt,text/plain"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Textarea */}
            <div className="space-y-1.5">
              <Label>Or paste contents</Label>
              <Textarea
                placeholder={'DATABASE_URL=postgresql://...\nAPI_KEY=sk-...\nNODE_ENV=production'}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError('');
                }}
                rows={6}
                className="font-mono text-xs resize-none whitespace-pre max-h-80"
              />
            </div>

            {/* Preview */}
            {parsed.length > 0 && (
              <div className="rounded-md border border-border overflow-hidden">
                <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
                  {parsed.length} variable{parsed.length !== 1 ? 's' : ''} detected
                </div>
                <div className="max-h-36 overflow-y-auto">
                  {parsed.slice(0, 50).map((entry) => (
                    <div
                      key={entry.key}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs border-b border-border/50 last:border-0 font-mono"
                    >
                      <span className="font-medium min-w-0 truncate flex-1">{entry.key}</span>
                      <span className="text-muted-foreground shrink-0">
                        {entry.value ? '•••••' : <span className="italic">empty</span>}
                      </span>
                    </div>
                  ))}
                  {parsed.length > 50 && (
                    <div className="px-3 py-1.5 text-xs text-muted-foreground text-center">
                      +{parsed.length - 50} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="env-select">Target environment</Label>
                </div>
                <Select value={environmentId} onValueChange={setEnvironmentId}>
                  <SelectTrigger id="env-select" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_ENVIRONMENTS.map((env) => (
                      <SelectItem key={env.id} value={env.id}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="group-select">Target group</Label>
                </div>
                <Select value={group} onValueChange={(value) => setGroup(value as SecretGroup)}>
                  <SelectTrigger id="group-select" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_SECRET_GROUPS.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="overwrite-toggle">Overwrite existing</Label>
                  <p className="text-xs text-muted-foreground">Update secrets that already exist</p>
                </div>
                <Switch id="overwrite-toggle" checked={overwrite} onCheckedChange={setOverwrite} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                <XCircleIcon size={15} className="text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={parsed.length === 0 || loading}>
              {loading ? (
                <>
                  <Loader2Icon size={15} className="animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <UploadIcon size={15} />
                  Import {parsed.length > 0 ? parsed.length : ''} secret{parsed.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
