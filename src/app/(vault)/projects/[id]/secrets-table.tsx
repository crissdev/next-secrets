import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortDirection,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Eye, EyeOff, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import SecretTypeIcon from '@/app/(vault)/projects/[id]/secret-type-icon';
import DeleteSecretDialog from '@/app/(vault)/projects/delete-secret-dialog';
import EditSecretDialog from '@/app/(vault)/projects/edit-secret-dialog';
import { secretTypeColors } from '@/app/(vault)/projects/secret-color-mapping';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Secret, type SECRET_TYPE } from '@/lib/definitions';

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
    <ArrowUpDown className="ml-2 h-4 w-4" />
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
          desc: !!column.columnDef.sortDescFirst,
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
    setSorting(newSorting);
  }, []);

  return {
    sorting,
    onChangeSorting,
  };
}

export default function SecretsTable(props: { data: Secret[] }) {
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
              <SecretTypeIcon type={row.getValue('type')} />
              <div className={'flex flex-col'}>
                <span className={'font-medium'} data-testid={`secret-name-${row.index}`}>
                  {row.getValue('name')}
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
          const type: SECRET_TYPE = row.getValue('type');
          return (
            <span className={`font-medium px-2 rounded-full text-xs inline-block leading-5 ${secretTypeColors[type]}`}>
              {type}
            </span>
          );
        },
      },
      {
        header: () => <div className={'pl-2'}>Value</div>,
        accessorKey: 'value',
        cell: function ValueCellRenderer({ row }) {
          const value = row.getValue<string>('value');
          const [showSecret, setShowSecret] = useState(false);

          const onCopyToClipboard = async (text: string) => {
            await navigator.clipboard.writeText(text);
            toast.message('Copied to clipboard', {
              description: 'Secret value has been copied to clipboard..',
              invert: true,
              position: 'bottom-right',
            });
          };

          return (
            <div className={'flex items-center gap-3'}>
              <span className={'w-[18ch] overflow-hidden text-ellipsis bg-muted rounded-md py-1 px-3 h-7'}>
                {showSecret ? value : '•'.repeat(8)}
              </span>
              <div className={'flex items-center'}>
                <Button
                  aria-label={'Copy secret'}
                  variant={'ghost'}
                  size={'icon'}
                  className={'px-0 size-8'}
                  onClick={() => onCopyToClipboard(value)}
                >
                  <Copy />
                </Button>
                <Button
                  aria-label={'Show secret'}
                  variant={'ghost'}
                  size={'icon'}
                  className={'px-0 size-8'}
                  onClick={() => setShowSecret(!showSecret)}
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
        accessorKey: 'lastUpdated',
        cell: function LastUpdatedCellRenderer({ row }) {
          const lastUpdated = row.getValue<string>('lastUpdated');
          const [localeDate, setLocaleDate] = useState(lastUpdated);

          const date = useMemo(() => (lastUpdated ? new Date(lastUpdated) : null), [lastUpdated]);
          const formattedDate = date ? formatDate(date) : null;

          useEffect(() => {
            if (date) {
              setLocaleDate(date.toLocaleString());
            }
          }, [date]);

          return !lastUpdated ? <div>&ndash;</div> : <div title={localeDate}>{formattedDate}</div>;
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
    [onChangeSorting],
  );

  const table = useReactTable({
    data: props.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className={'h-12'}>
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
                <TableCell className={'p-4'} key={cell.id}>
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
