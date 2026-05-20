'use client';

import { LockIcon, SearchIcon } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';

import AddSecretButton from '@/app/(app)/projects/[id]/add-secret-button';
import SecretsTable from '@/app/(app)/projects/[id]/secrets-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SecretGroup, type SecretType } from '@/lib/db/prisma-client/enums';
import { DEFAULT_ENVIRONMENTS, DEFAULT_SECRET_GROUPS, type Secret } from '@/lib/definitions';
import { toTitleCase } from '@/lib/string-util';

const ALL_ENVIRONMENTS = 'all';
const ALL_GROUPS = 'all';
const ALL_SECRET_TYPES = 'none';

export default function SecretList(props: {
  secretsPromise: Promise<Secret[]>;
  projectInfo: { id: string; name: string };
  onFilterChanged(value: Secret[]): void;
}) {
  const secrets = use(props.secretsPromise);
  const [filter, setFilter] = useState('');
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(ALL_ENVIRONMENTS);
  const [selectedGroup, setSelectedGroup] = useState<SecretGroup | typeof ALL_GROUPS>(SecretGroup.RUNTIME_APPLICATION);
  const [selectedSecretType, setSelectedSecretType] = useState<SecretType | typeof ALL_SECRET_TYPES>(ALL_SECRET_TYPES);
  const allSecretTypes = [...new Set(secrets.map((s) => s.type))];
  const normalizedFilter = filter.trim().toLowerCase();

  const filteredSecrets = useMemo(
    () =>
      secrets
        .filter(
          (secret) => selectedEnvironmentId === ALL_ENVIRONMENTS || secret.environmentId === selectedEnvironmentId,
        )
        .filter((secret) => selectedGroup === ALL_GROUPS || secret.group === selectedGroup)
        .filter((secret) => selectedSecretType === ALL_SECRET_TYPES || secret.type === selectedSecretType)
        .filter(
          (secret) =>
            !normalizedFilter ||
            secret.name.toLowerCase().includes(normalizedFilter) ||
            secret.description.toLowerCase().includes(normalizedFilter),
        ),
    [secrets, selectedEnvironmentId, selectedGroup, selectedSecretType, normalizedFilter],
  );

  const { onFilterChanged } = props;
  useEffect(() => {
    onFilterChanged(filteredSecrets);
  }, [filteredSecrets, onFilterChanged]);

  const [condensedLayout] = useState(false);

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
    <div className={'p-3 sm:p-5 h-full'}>
      <div className={'flex flex-col gap-2 items-stretch lg:flex-row lg:items-center mb-4 w-full'}>
        <div className={'relative'}>
          <SearchIcon size={16} className={'stroke-muted-foreground absolute left-2 top-1/2 -translate-y-1/2'} />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search secrets..."
            className="bg-white lg:w-[32ch] w-full pl-8 mr-2"
          />
        </div>
        <div className="lg:w-full grid grid-cols-2 lg:flex lg:justify-end items-center gap-2">
          <Select
            onValueChange={(value) => setSelectedGroup(value === ALL_GROUPS ? value : (value as SecretGroup))}
            value={selectedGroup}
          >
            <SelectTrigger className={'w-full lg:w-44 bg-white'} aria-label={'Select secret group'}>
              <SelectValue placeholder={'Runtime app'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem aria-label={'All groups'} value={ALL_GROUPS}>
                  All groups
                </SelectItem>
                {DEFAULT_SECRET_GROUPS.map(({ id, name }) => (
                  <SelectItem value={id} key={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setSelectedEnvironmentId(value)} value={String(selectedEnvironmentId)}>
            <SelectTrigger className={'w-full lg:w-[180px] bg-white'} aria-label={'Select environment'}>
              <SelectValue placeholder={'All environments'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem aria-label={'All environments'} value={ALL_ENVIRONMENTS}>
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
            onValueChange={(value) => setSelectedSecretType(value === ALL_SECRET_TYPES ? value : (value as SecretType))}
            value={selectedSecretType}
          >
            <SelectTrigger className={'w-full lg:w-50 bg-white'} aria-label={'Select secret type'}>
              <SelectValue placeholder={'All secret types'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem aria-label={'All secret types'} value={ALL_SECRET_TYPES}>
                  All secret types
                </SelectItem>
                {allSecretTypes.map((type) => (
                  <SelectItem value={type} key={type}>
                    {toTitleCase(type)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SecretsTable projectId={props.projectInfo.id} data={filteredSecrets} condensedLayout={condensedLayout} />
    </div>
  );
}
