/**
 * @file components/Custom/data-table.tsx
 * @description This component provides a generic data table with pagination, sorting, and filtering capabilities.
 * It integrates with `nuqs` for URL-based state management, ensuring that table state is reflected in and
 * initialized from the URL query parameters. This design reduces unnecessary re-renders and allows for
 * server-side data fetching based on URL parameters.
 */

'use client';

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    //   getFacetedRowModel,
    getSortedRowModel,
    type PaginationState, // Type for pagination state from @tanstack/react-table
    type SortingState,
    type Updater, // Type for state updater functions from @tanstack/react-table
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useQueryState } from 'nuqs';
import {
    type ReactNode,
    useMemo, // Memoizes values to prevent unnecessary re-computation
    useState, // Manages internal component state (e.g., column visibility)
} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

/**
 * Base properties for the DataTable component.
 * @template TData The type of data in the table rows.
 * @template TValue The type of value for a column.
 */
interface DataTableBaseProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]; // Column definitions for the table
    data: TData[]; // Initial data to display in the table
    title?: string; // Optional title for the table
    total: number; // Total number of records (for pagination)
}

/**
 * Defines the possible configurations for the DataTable's header action.
 * It can either accept a ReactNode directly, or a URL and label for a button.
 * @template TData The type of data in the table rows.
 * @template TValue The type of value for a column.
 */
type DataTableProps<TData, TValue> = DataTableBaseProps<TData, TValue> &
    (
        | {
            headerActionNode: ReactNode; // Custom React node for header action
            headerActionUrl?: never; // Exclude URL if node is provided
            headerActionUrlLabel?: never; // Exclude label if node is provided
        }
        | {
            headerActionNode?: never; // Exclude node if URL is provided
            headerActionUrl: string; // URL for the header action button
            headerActionUrlLabel: string; // Label for the header action button
        }
        | {
            headerActionNode?: never; // No header action
            headerActionUrl?: never; // No header action
            headerActionUrlLabel?: never; // No header action
        }
    );

/**
 * A generic and reusable data table component with server-side pagination, sorting, and filtering.
 * It synchronizes its state with URL query parameters using `nuqs` for persistent and shareable table views.
 *
 * @template TData The type of data in the table rows.
 * @template TValue The type of value for a column.
 * @param {DataTableProps<TData, TValue>} props The properties for the DataTable.
 * @returns {JSX.Element} The rendered data table.
 */
export function DataTable<TData, TValue>({
    columns,
    data: initialData,
    total,
    title,
    headerActionNode,
    headerActionUrl,
    headerActionUrlLabel,
}: DataTableProps<TData, TValue>) {
    // State for column visibility, managed internally as it doesn't affect server-side data fetching
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    // Query states for URL synchronization, replacing local useState and useEffect for these.
    // These hooks automatically read from and write to the URL query parameters.
    const [queryFilterSearch, setQueryFilterSearch] = useQueryState('search');
    const [queryPage, setQueryPage] = useQueryState('page', {
        defaultValue: 1, // Default page is 1
        parse: (value) => Number.parseInt(value, 10), // Parse page number from string to integer with radix 10
        serialize: (value) => value.toString(), // Serialize page number from integer to string
    });
    const [queryPageSize, setQueryPageSize] = useQueryState('pageSize', {
        defaultValue: 10, // Default page size is 10
        parse: (value) => Number.parseInt(value, 10), // Parse page size from string to integer with radix 10
        serialize: (value) => value.toString(), // Serialize page size from integer to string
    });
    const [querySortBy, setQuerySortBy] = useQueryState('sortBy', {
        defaultValue: 'created_at', // Default sort column
    });
    const [queryOrder, setQueryOrder] = useQueryState('order', {
        defaultValue: 'desc', // Default sort order
    });
    const [queryFilters, setQueryFilters] = useQueryState('filters', {
        parse: (value) => {
            try {
                return JSON.parse(value); // Parse filters from JSON string
            } catch {
                // Log error for debugging, but avoid console.error in production
                // console.error('Failed to parse filters from URL:', error);
                return []; // Return empty array on parsing error
            }
        },
        serialize: (value) => JSON.stringify(value), // Serialize filters to JSON string
    });

    /**
     * Derived state for react-table, synchronized with URL query parameters.
     * `useMemo` is used to prevent unnecessary re-computation of these objects on every render.
     */
    const columnFilters: ColumnFiltersState = useMemo(() => {
        // Prioritize `filters` query param, fallback to `search` for backward compatibility
        if (queryFilters && queryFilters.length > 0) {
            return queryFilters;
        }
        if (queryFilterSearch && queryFilterSearch.length > 0) {
            return [{ id: 'id', value: queryFilterSearch }];
        }
        return [];
    }, [queryFilters, queryFilterSearch]);

    const pagination = useMemo(
        () => ({
            pageIndex: queryPage - 1, // react-table is 0-indexed, URL is 1-indexed
            pageSize: queryPageSize,
        }),
        [queryPage, queryPageSize]
    );

    const sorting: SortingState = useMemo(
        () => [{ id: querySortBy, desc: queryOrder === 'desc' }],
        [querySortBy, queryOrder]
    );

    /**
     * Handlers for updating URL query parameters based on table interactions.
     * These functions are passed to `useReactTable` and ensure that changes
     * in table state are reflected in the URL.
     */
    const onPaginationChange = (updater: Updater<PaginationState>) => {
        const newPagination =
            typeof updater === 'function' ? updater(pagination) : updater;
        setQueryPage(newPagination.pageIndex + 1); // Convert to 1-indexed for URL
        setQueryPageSize(newPagination.pageSize, {
            shallow: false,
        });
    };

    const onSortingChange = (updater: Updater<SortingState>) => {
        const newSorting =
            typeof updater === 'function' ? updater(sorting) : updater;
        if (newSorting.length > 0) {
            setQuerySortBy(newSorting[0].id);
            setQueryOrder(newSorting[0].desc ? 'desc' : 'asc', {
                shallow: false,
            });
        } else {
            setQuerySortBy('created_at'); // Default sort column
            setQueryOrder('desc', {
                shallow: false,
            }); // Default sort order
        }
    };

    const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
        const newFilters =
            typeof updater === 'function' ? updater(columnFilters) : updater;
        if (newFilters.length > 0) {
            setQueryFilters(newFilters, {
                shallow: false,
            });
        } else {
            setQueryFilters(null, {
                shallow: false,
            }); // Clear filters if no filters are active
        }
        // Clear the old 'search' query parameter if filters are now being used
        if (queryFilterSearch) {
            setQueryFilterSearch(null, {
                shallow: false,
            });
        }
    };

    // Initialize the react-table instance with manual control over pagination, sorting, and filtering.
    const table = useReactTable({
        data: initialData, // Data provided to the table
        columns, // Column definitions
        manualPagination: true, // Enable manual pagination (server-side)
        manualSorting: true, // Enable manual sorting (server-side)
        manualFiltering: true, // Enable manual filtering (server-side)
        enableRowSelection: false, // Disable row selection
        rowCount: total, // Total number of rows for pagination
        state: {
            sorting, // Current sorting state
            columnVisibility, // Current column visibility state
            columnFilters, // Current column filters state
            pagination, // Current pagination state
        },
        onPaginationChange, // Handler for pagination changes
        onSortingChange, // Handler for sorting changes
        onColumnFiltersChange, // Handler for column filter changes
        onColumnVisibilityChange: setColumnVisibility, // Handler for column visibility changes
        getCoreRowModel: getCoreRowModel(), // Core row model
        getSortedRowModel: getSortedRowModel(), // Sorted row model
        // getFacetedRowModel: getFacetedRowModel(), // Faceted row model for filters
        // getFacetedUniqueValues: (table, columnId) => () => {
        //   const uniqueValues = new Map<unknown, number>();
        //   // This is a placeholder. In a real application, you would fetch these from the server.
        //   // For demonstration, we'll simulate some unique values based on the current data.
        //   for (const row of table.getPreFilteredRowModel().flatRows) {
        //     const value = row.getValue(columnId);
        //     if (value) {
        //       const stringValue = String(value);
        //       uniqueValues.set(stringValue, (uniqueValues.get(stringValue) || 0) + 1);
        //     }
        //   }
        //   return uniqueValues;
        // },
        // getFacetedMinMaxValues: (table, columnId) => () => {
        //   let min: number | undefined;
        //   let max: number | undefined;
        //   // This is a placeholder. In a real application, you would fetch these from the server.
        //   for (const row of table.getPreFilteredRowModel().flatRows) {
        //     const value = row.getValue(columnId);
        //     if (typeof value === 'number') {
        //       if (min === undefined || value < min) {
        //         min = value;
        //       }
        //       if (max === undefined || value > max) {
        //         max = value;
        //       }
        //     }
        //   }
        //   return [min, max] as [number, number];
        // },
    });

    // Runtime checks for header action props to ensure consistency
    if (headerActionUrl && !headerActionUrlLabel) {
        throw new Error(
            'headerActionUrlLabel is required when headerActionUrl is provided.'
        );
    }
    if (headerActionUrlLabel && !headerActionUrl) {
        throw new Error(
            'headerActionUrl is required when headerActionUrlLabel is provided.'
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h1 className="font-bold text-2xl capitalize">
                    {title}
                </h1>
                {/* Render custom header action node if provided */}
                {headerActionNode && headerActionNode}
                {/* Render header action button if URL and label are provided */}
                {!headerActionNode && headerActionUrl && headerActionUrlLabel && (
                    <Button asChild>
                        <a href={headerActionUrl}>{headerActionUrlLabel}</a>
                    </Button>
                )}
            </div>
            {/* Toolbar for search, filters, and column visibility */}
            <DataTableToolbar table={table} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            className={
                                                header.column.getCanSort() ? 'cursor-pointer' : ''
                                            }
                                            colSpan={header.colSpan}
                                            key={header.id}
                                            {...(header.column.getCanSort()
                                                ? { onClick: header.column.getToggleSortingHandler() }
                                                : {})}
                                        >
                                            <div className="flex transition-all">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                {/* Display sorting icons */}
                                                {header.column.getIsSorted() === 'asc' && <ChevronUp />}
                                                {header.column.getIsSorted() === 'desc' && (
                                                    <ChevronDown />
                                                )}
                                            </div>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {/* Render table rows if data is available */}
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    data-state={row.getIsSelected() && 'selected'}
                                    key={row.id}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            // Display "No results." if no data
                            <TableRow>
                                <TableCell
                                    className="h-24 text-center"
                                    colSpan={columns.length}
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination controls for the table */}
            <DataTablePagination table={table} />
        </div>
    );
}
