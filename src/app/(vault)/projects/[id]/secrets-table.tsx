import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Code,
  Database,
  FileText,
  Key,
  Lock,
  PencilLineIcon,
  Trash2Icon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import DeleteSecretDialog from '@/app/(vault)/delete-secret-dialog';
import EditSecretDialog from '@/app/(vault)/projects/edit-secret-dialog';
import { secretTypeColors } from '@/app/(vault)/secret-color-mapping';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Secret, SECRET_TYPE } from '@/lib/definitions';

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

export default function SecretsTable(props: { data: Secret[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Secret>[]>(
    () => [
      {
        header: ({ column }) => (
          <Button
            variant={'ghost'}
            onClick={() => {
              if (column.getIsSorted() === 'desc') {
                setSorting([]);
              } else {
                setSorting([
                  {
                    id: column.id,
                    desc: column.getIsSorted() === 'asc',
                  },
                ]);
              }
            }}
            className="hover:!bg-transparent w-full justify-start"
          >
            Name
            {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
            {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
          </Button>
        ),
        accessorKey: 'name',
        cell: ({ row }) => {
          const secretTypeColors: Record<SECRET_TYPE, string> = {
            [SECRET_TYPE.ApiKey]: 'bg-blue-100 text-blue-800',
            [SECRET_TYPE.ConnectionString]: 'bg-green-100 text-green-800',
            [SECRET_TYPE.EnvironmentVariable]: 'bg-purple-100 text-purple-800',
            [SECRET_TYPE.Other]: 'bg-slate-100 text-slate-800',
            [SECRET_TYPE.Password]: 'bg-amber-100 text-amber-800',
            [SECRET_TYPE.Token]: 'bg-indigo-100 text-indigo-800',
          };
          const getColorForSecretType = (type: SECRET_TYPE) => {
            return secretTypeColors[type] || 'bg-slate-100 text-slate-800';
          };
          const typeColor = getColorForSecretType(row.original.type);
          return (
            <div className={'flex items-center gap-4'}>
              <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-md ${typeColor}`}>
                {row.original.type === SECRET_TYPE.Token || row.original.type === SECRET_TYPE.ApiKey ? (
                  <Key className="h-5 w-5" />
                ) : row.original.type === 'Password' ? (
                  <Lock className="h-5 w-5" />
                ) : row.original.type === 'Connection String' ? (
                  <Database className="h-5 w-5" />
                ) : row.original.type === 'Environment Variable' ? (
                  <Code className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
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
        header: () => <div className={'pl-2'}>Type</div>,
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
        cell: ({ row }) => {
          const value = row.getValue<string>('value');
          const showSecrets = false;

          return <div>{showSecrets ? value : '•'.repeat(8)}</div>;
        },
      },
      {
        header: () => <div className={'pl-2'}>Last Updated</div>,
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
    [],
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
