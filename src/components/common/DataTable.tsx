import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    getPaginationRowModel,
} from '@tanstack/react-table';
import { Button } from './Button';
import { useAppSelector } from '../../app/hooks';
import { useEffect } from 'react';

interface DataTableProps<T extends object> {
    data: T[];
    columns: ColumnDef<T, any>[];
    isLoading?: boolean;
}

export function DataTable<T extends object>({ data, columns, isLoading }: DataTableProps<T>) {
    const { globalSettings } = useAppSelector((state) => state.settings);
    const pageSize = globalSettings?.pagination_records || 10;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
        },
    });

    useEffect(() => {
        table.setPageSize(pageSize);
    }, [pageSize, table]);

    if (isLoading) {
        return (
            <div className="w-full overflow-hidden rounded-lg animate-pulse">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                            <tr>
                                {Array.from({ length: columns.length }).map((_, idx) => (
                                    <th key={idx} className="px-4 py-3 border-b border-zinc-100 dark:border-mauve-800">
                                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-neutral-800">
                            {Array.from({ length: 5 }).map((_, rowIdx) => (
                                <tr key={rowIdx}>
                                    {Array.from({ length: columns.length }).map((_, colIdx) => (
                                        <td key={colIdx} className="px-4 py-4">
                                            <div className="h-4 bg-neutral-100 dark:bg-neutral-700/50 rounded w-full"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-zinc-100 dark:border-mauve-800 bg-neutral-50 dark:bg-neutral-800/50 flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                        <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                    </div>
                    <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-lg border border-zinc-100 dark:border-mauve-800">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 uppercase text-xs font-semibold">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-4 py-3 border-b border-zinc-100 dark:border-mauve-800">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-neutral-800">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-500">
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-100 dark:border-mauve-800 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex gap-2">
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-1 px-3 border rounded text-xs disabled:opacity-50"
                    >
                        Previous
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-1 px-3 border rounded text-xs disabled:opacity-50"
                    >
                        Next
                    </Button>
                </div>
                <span className="text-xs text-zinc-500">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
            </div>
        </div>
    );
}
