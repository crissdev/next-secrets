'use client';

import { LockIcon, SearchIcon } from 'lucide-react';
import { use, useState } from 'react';

import SecretsTable from '@/app/(vault)/projects/[id]/secrets-table';
import AddSecretButton from '@/app/(vault)/projects/add-secret-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_ENVIRONMENTS, type Secret, type SECRET_TYPE } from '@/lib/definitions';

export default function SecretList(props: {
  secretsPromise: Promise<Secret[]>;
  projectInfo: { id: string; name: string };
}) {
  const secrets = use(props.secretsPromise);
  const [filter, setFilter] = useState('');
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<number>(0);
  const [selectedSecretType, setSelectedSecretType] = useState<SECRET_TYPE | 'none'>('none');
  const allSecretTypes = [...new Set(secrets.map((s) => s.type))];

  const filteredSecrets = secrets
    .filter((secret) => !selectedEnvironmentId || secret.environmentId === selectedEnvironmentId)
    .filter((secret) => selectedSecretType === 'none' || secret.type === selectedSecretType);

  return secrets.length === 0 ? (
    <div className={'h-full flex items-center'}>
      <div className="max-w-md text-center mx-auto">
        <div className={'rounded-full bg-muted mb-6 p-6 flex items-center justify-center w-min mx-auto'}>
          <LockIcon size={48} className={'stroke-muted-foreground'} />
        </div>

        <h2 className={'text-xl font-bold mb-3'} data-testid="no-secrets-message">
          No secrets yet
        </h2>

        <div className={'text-muted-foreground mb-5'} data-testid="no-secrets-hint">
          Add your first secret to the &#34;{props.projectInfo.name}&#34; project.
        </div>

        <AddSecretButton testId={'empty-list-add-secret'} />
      </div>
    </div>
  ) : (
    <div className={'p-5 h-full'}>
      <div className={'relative  mb-4 flex items-center'}>
        <div className={'absolute left-2 top-1/2 -translate-y-1/2'}>
          <SearchIcon size={16} className={'stroke-muted-foreground'} />
        </div>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search secrets..."
          className="bg-white w-[32ch] pl-8"
        />
        <div className="ml-auto flex items-center gap-2">
          <Select
            onValueChange={(value) => setSelectedEnvironmentId(Number(value))}
            value={String(selectedEnvironmentId)}
          >
            <SelectTrigger className={'w-[180px] bg-white'} aria-label={'Select environment'}>
              <SelectValue placeholder={'All environments'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem aria-label={'All environments'} value={'0'}>
                  All environments
                </SelectItem>
                {DEFAULT_ENVIRONMENTS.map(({ id, name }) => (
                  <SelectItem value={String(id)} key={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setSelectedSecretType(value === 'none' ? value : (value as SECRET_TYPE))}
            value={selectedSecretType}
          >
            <SelectTrigger className={'w-[200px] bg-white'} aria-label={'Select secret type'}>
              <SelectValue placeholder={'All secret types'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem aria-label={'All secret types'} value={'none'}>
                  All secret types
                </SelectItem>
                {allSecretTypes.map((type) => (
                  <SelectItem value={type} key={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <SecretsTable projectId={props.projectInfo.id} data={filteredSecrets} filter={filter} />
    </div>
  );
}
