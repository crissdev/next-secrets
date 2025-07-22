import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Secret } from '@/lib/definitions';

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
          return (
            <div className={'flex flex-col'}>
              <span className={'font-medium'} data-testid={`secret-name-${row.index}`}>
                {row.getValue('name')}
              </span>
              <span data-testid={`secret-description-${row.index}`} className={'text-sm text-muted-foreground'}>
                {row.original.description}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Value',
        accessorKey: 'value',
        cell: ({ row }) => {
          const value = row.getValue<string>('value');
          const showSecrets = false;

          return <div>{showSecrets ? value : '•'.repeat(8)}</div>;
        },
      },
      {
        id: 'actions',
        header: () => <div className={'text-right'}>Actions</div>,
        cell: () => {
          return (
            <div className={'flex items-center justify-end'}>
              <Button variant={'link'}>
                <PencilLineIcon />
                <span className={'sr-only'}>Edit</span>
              </Button>
              <Button variant={'link'} className={'text-destructive'}>
                <Trash2Icon size={20} className={'text-destructive'} />
                <span className={'sr-only'}>Delete</span>
              </Button>
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
                <TableHead key={header.id}>
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
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
