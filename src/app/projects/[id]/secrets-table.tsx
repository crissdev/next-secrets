import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortDirection,
  type SortingState,
  useReactTable
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Eye, EyeOff, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { startTransition, useActionState, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import SecretTypeIcon from '@/app/projects/[id]/secret-type-icon';
import DeleteSecretDialog from '@/app/projects/delete-secret-dialog';
import EditSecretDialog from '@/app/projects/edit-secret-dialog';
import { secretTypeColors } from '@/app/projects/secret-color-mapping';
import { LoadingDots } from '@/components/loading-dots';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getSecretValueAction } from '@/lib/actions';
import { DEFAULT_ENVIRONMENTS, type Secret } from '@/lib/definitions';

function formatDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths > 0) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
}

function SortIcon(props: { direction: false | SortDirection }) {
  return props.direction === false ? (
    <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-75" />
  ) : props.direction === 'asc' ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : props.direction === 'desc' ? (
    <ArrowDown className="ml-2 h-4 w-4" />
  ) : null;
}

function useSortingState() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const onChangeSorting = useCallback((column: Column<Secret>) => {
    let newSorting: SortingState = [];

    if (column.getIsSorted() === false) {
      newSorting = [
        {
          id: column.id,
          desc: column.columnDef.sortDescFirst ?? false,
        },
      ];
    } else if (column.columnDef.sortDescFirst) {
      if (column.getIsSorted() !== 'asc') {
        newSorting = [
          {
            id: column.id,
            desc: column.getIsSorted() === 'asc',
          },
        ];
      }
    } else if (column.getIsSorted() !== 'desc') {
      newSorting = [
        {
          id: column.id,
          desc: column.getIsSorted() === 'asc',
        },
      ];
    }
    startTransition(() => setSorting(newSorting));
  }, []);

  return {
    sorting,
    onChangeSorting,
  };
}

export default function SecretsTable(props: {
  projectId: string;
  data: Secret[];
  filter?: string;
  condensedLayout?: boolean;
}) {
  const { sorting, onChangeSorting } = useSortingState();

  const columns = useMemo<ColumnDef<Secret>[]>(
    () => [
      {
        header: ({ column }) => (
          <Button
            variant={'ghost'}
            onClick={() => onChangeSorting(column)}
            className="hover:!bg-transparent w-full justify-start"
          >
            Name
            <SortIcon direction={column.getIsSorted()} />
          </Button>
        ),
        accessorKey: 'name',
        cell: ({ row }) => {
          return (
            <div className={'flex items-center gap-4'}>
              <SecretTypeIcon
                size={props.condensedLayout ? 'small' : 'default'}
                type={row.getValue<Secret['type']>('type')}
              />
              <div className={'flex flex-col'}>
                <span className={'font-medium'} data-testid={`secret-name-${row.index}`}>
                  {row.getValue<Secret['name']>('name')}
                </span>
                <span data-testid={`secret-description-${row.index}`} className={'text-sm text-muted-foreground'}>
                  {row.original.description}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: ({ column }) => (
          <Button
            variant={'ghost'}
            onClick={() => onChangeSorting(column)}
            className="hover:!bg-transparent w-full justify-start"
          >
            Type
            <SortIcon direction={column.getIsSorted()} />
          </Button>
        ),
        accessorKey: 'type',
        cell: ({ row }) => {
          const type = row.getValue<Secret['type']>('type');
          return (
            <span
              className={`font-medium px-2 rounded-full text-xs inline-block leading-5 ${secretTypeColors[type]}`}
              data-testid={`secret-type-${row.index}`}
            >
              {type}
            </span>
          );
        },
      },
      {
        header: ({ column }) => (
          <Button
            variant={'ghost'}
            onClick={() => onChangeSorting(column)}
            className="hover:!bg-transparent w-full justify-start"
          >
            Environment
            <SortIcon direction={column.getIsSorted()} />
          </Button>
        ),
        accessorKey: 'environmentId',
        cell: ({ row }) => {
          const environmentId = row.getValue<Secret['environmentId']>('environmentId');
          const environmentName = DEFAULT_ENVIRONMENTS.find((e) => e.id === environmentId)?.name;
          return (
            <Badge variant={'outline'} className={'rounded-full'} data-testid={`secret-environment-${row.index}`}>
              {environmentName ?? '–'}
            </Badge>
          );
        },
      },
      {
        header: () => <div className={'pl-2'}>Value</div>,
        accessorKey: 'value',
        cell: function ValueCellRenderer({ row }) {
          const value = row.getValue<Secret['value']>('value');
          const [showSecret, setShowSecret] = useState(false);
          const [secretValue, setSecretValue] = useState<string | null>(null);

          const [, fetchSecretAction, isFetchSecretPending] = useActionState(async () => {
            if (!secretValue && !isCopyPending) {
              const actionResult = await getSecretValueAction(row.original.id);
              if (actionResult.success) {
                setSecretValue(actionResult.data);
                return;
              } else {
                toast.error('Failed to fetch secret value', {
                  description: actionResult.error.message,
                  position: 'bottom-right',
                });
                return;
              }
            }
          }, undefined);

          const [, copySecretAction, isCopyPending] = useActionState(async () => {
            let valueToCopy = secretValue;
            if (!valueToCopy) {
              const actionResult = await getSecretValueAction(row.original.id);
              if (actionResult.success) {
                valueToCopy = actionResult.data;
                setSecretValue(valueToCopy);
              } else {
                toast.error('Failed to fetch secret value', {
                  description: actionResult.error.message,
                  position: 'bottom-right',
                });
                return;
              }
            }
            await navigator.clipboard.writeText(valueToCopy);
            toast.message('Copied to clipboard', {
              description: 'Secret value has been copied to clipboard.',
              invert: true,
              position: 'bottom-right',
            });
          }, undefined);

          const onCopyToClipboard = () => {
            startTransition(() => copySecretAction());
          };

          const onShowSecret = () => {
            const shouldShowSecret = !showSecret;
            setShowSecret(shouldShowSecret);
            if (shouldShowSecret && !secretValue) {
              startTransition(() => fetchSecretAction());
            }
          };

          return (
            <div className={'flex items-center gap-3'}>
              {isFetchSecretPending || isCopyPending ? (
                <div className={'w-[18ch] bg-muted py-1 px-3 h-7'}>
                  <LoadingDots delay={200} />
                </div>
              ) : (
                <span
                  className={'w-[18ch] overflow-hidden text-ellipsis bg-muted rounded-md py-1 px-3 h-7'}
                  data-testid={`secret-value-${row.index}`}
                >
                  {showSecret ? (secretValue ?? value) : '•'.repeat(8)}
                </span>
              )}
              <div className={'flex items-center'}>
                <Button
                  data-testid={`copy-secret-${row.index}`}
                  aria-label={'Copy secret'}
                  variant={'ghost'}
                  size={'icon'}
                  className={'px-0 size-8'}
                  onClick={onCopyToClipboard}
                  disabled={isCopyPending}
                >
                  <Copy />
                </Button>
                <Button
                  data-testid={`show-secret-${row.index}`}
                  aria-label={'Show secret'}
                  variant={'ghost'}
                  size={'icon'}
                  className={'px-0 size-8'}
                  onClick={onShowSecret}
                  disabled={isFetchSecretPending}
                >
                  {showSecret ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
          );
        },
      },
      {
        header: ({ column }) => (
          <Button
            variant={'ghost'}
            onClick={() => onChangeSorting(column)}
            className="hover:!bg-transparent w-full justify-start"
          >
            Last Updated
            <SortIcon direction={column.getIsSorted()} />
          </Button>
        ),
        sortDescFirst: true,
        accessorKey: 'updatedAt',
        cell: function LastUpdatedCellRenderer({ row }) {
          // SecretsTable is renders on the client, hence the updatedAt is serialized as a string.
          const lastUpdated = row.getValue<Secret['updatedAt']>('updatedAt');
          const [localeDate, setLocaleDate] = useState(new Date(lastUpdated));

          const date = useMemo(() => (lastUpdated ? lastUpdated : null), [lastUpdated]);
          const formattedDate = date ? formatDate(date) : null;

          useEffect(() => {
            if (date) {
              setLocaleDate(date);
            }
          }, [date]);

          return (
            <div data-testid={`secret-updated-${row.index}`}>
              {lastUpdated ? (
                <Tooltip delayDuration={400}>
                  <TooltipTrigger>{formattedDate}</TooltipTrigger>
                  <TooltipContent>{localeDate.toLocaleString()}</TooltipContent>
                </Tooltip>
              ) : (
                '–'
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className={'text-right pr-4'}>Actions</div>,
        cell: function ActionsCellRenderer({ row }) {
          const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
          const [editDialogOpen, setEditDialogOpen] = useState(false);
          const { id: selectedProjectId } = useParams<{ id: string }>();

          return (
            <div className={'flex items-center justify-end'}>
              <Button variant={'link'} onClick={() => setEditDialogOpen(true)}>
                <PencilLineIcon />
                <span className={'sr-only'}>Edit</span>
              </Button>
              <Button variant={'link'} className={'text-destructive'} onClick={() => setDeleteDialogOpen(true)}>
                <Trash2Icon size={20} className={'text-destructive'} />
                <span className={'sr-only'}>Delete</span>
              </Button>

              {deleteDialogOpen && (
                <DeleteSecretDialog
                  open
                  onClose={() => setDeleteDialogOpen(false)}
                  projectId={selectedProjectId}
                  secretId={row.original.id}
                  secretName={row.original.name}
                />
              )}

              {editDialogOpen && (
                <EditSecretDialog
                  open
                  onClose={() => setEditDialogOpen(false)}
                  projectId={selectedProjectId}
                  secret={row.original}
                />
              )}
            </div>
          );
        },
      },
    ],
    [props.condensedLayout, onChangeSorting],
  );

  const table = useReactTable({
    data: props.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: props.filter,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className={`h-12 ${props.condensedLayout ? 'px-0' : ''}`}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell) => (
                <TableCell className={`${props.condensedLayout ? 'py-1 px-2' : 'p-4'}`} key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
