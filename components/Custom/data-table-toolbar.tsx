'use client';
import type { Table } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  HelpCircle,
  Timer,
  X,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { MultiSelectFilter } from '@/components/Custom/data-table-multi-select-filter';
import { DataTableViewOptions } from '@/components/Custom/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export const duration_types = [
  //   duration type
  {
    value: 'days',
    label: 'Days',
    icon: null,
  },
  {
    value: 'week',
    label: 'Week',
    icon: null,
  },
  {
    value: 'month',
    label: 'Month',
    icon: null,
  },
  {
    value: 'year',
    label: 'Year',
    icon: null,
  },
];

export const statuses = [
  {
    value: 'requested',
    label: 'Requested',
    icon: HelpCircle,
  },
  {
    value: 'enrolled',
    label: 'Enrolled',
    icon: HelpCircle,
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: HelpCircle,
  },

  {
    value: 'pending',
    label: 'Pending',
    icon: HelpCircle,
  },

  {
    value: 'failed',
    label: 'Failed',
    icon: Circle,
  },
  {
    value: 'refunded',
    label: 'Refunded',
    icon: Timer,
  },
];

export const methods = [
  {
    label: 'cash',
    value: 'Cash',
    icon: ArrowDown,
  },
  {
    label: 'bank_transfer',
    value: 'Bank Transfer',
    icon: ArrowRight,
  },
  {
    label: 'mobile_wallets',
    value: 'Mobile Wallets',
    icon: ArrowUp,
  },
  {
    label: 'fonepay',
    value: 'Fone Pay',
    icon: ArrowUp,
  },
];
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table?.getState().columnFilters.length > 0;
  const [_queryFilterSearch, _setQueryFilterSearch] = useQueryState('search');
  //   const [statusFilter, setStatusFilter] = useQueryState('status');
  //   const [methodFilter, setMethodFilter] = useQueryState('method');
  //   const [durationTypeFilter, setDurationTypeFilter] =
  //     useQueryState('duration_type');

  // Get available column IDs to prevent calling getColumn with non-existent IDs
  const availableColumnIds = table.getAllColumns().map((column) => column.id);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {availableColumnIds.includes('full_name') &&
          table?.getColumn('full_name') && (
            <Input
              className="h-8 w-[150px] lg:w-[250px]"
              onChange={(event) => {
                table
                  ?.getColumn('full_name')
                  ?.setFilterValue(event.target.value);
              }}
              placeholder="Filter data by users full name..."
              value={
                (table?.getColumn('full_name')?.getFilterValue() as string) ??
                ''
              }
            />
          )}
        {availableColumnIds.includes('title') && table?.getColumn('title') && (
          <Input
            className="h-8 w-[150px] lg:w-[250px]"
            onChange={(event) => {
              table?.getColumn('title')?.setFilterValue(event.target.value);
            }}
            placeholder="Filter data by title..."
            value={
              (table?.getColumn('title')?.getFilterValue() as string) ?? ''
            }
          />
        )}
        {availableColumnIds.includes('name') && table?.getColumn('name') && (
          <Input
            className="h-8 w-[150px] lg:w-[250px]"
            onChange={(event) => {
              table?.getColumn('name')?.setFilterValue(event.target.value);
            }}
            placeholder="Filter data by name..."
            value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
          />
        )}
        {availableColumnIds.includes('courseTitle') &&
          table?.getColumn('courseTitle') && (
            <Input
              className="h-8 w-[150px] lg:w-[250px]"
              onChange={(event) => {
                table
                  ?.getColumn('courseTitle')
                  ?.setFilterValue(event.target.value);
              }}
              placeholder="Filter data by course title..."
              value={
                (table?.getColumn('courseTitle')?.getFilterValue() as string) ??
                ''
              }
            />
          )}
        {availableColumnIds.includes('email') && table?.getColumn('email') && (
          <Input
            className="h-8 w-[150px] lg:w-[250px]"
            onChange={(event) => {
              table?.getColumn('email')?.setFilterValue(event.target.value);
            }}
            placeholder="Filter data by user email..."
            value={
              (table?.getColumn('email')?.getFilterValue() as string) ??
              _queryFilterSearch ??
              ''
            }
          />
        )}
        {availableColumnIds.includes('status') &&
          table?.getColumn('status') && (
            <MultiSelectFilter
              onValueChange={(values) => {
                table?.getColumn('status')?.setFilterValue(values);
              }}
              options={statuses}
              selectedValues={
                new Set(
                  table?.getColumn('status')?.getFilterValue() as string[]
                )
              }
              title="Status"
            />
          )}
        {availableColumnIds.includes('method') &&
          table?.getColumn('method') && (
            <MultiSelectFilter
              onValueChange={(values) => {
                table?.getColumn('method')?.setFilterValue(values);
              }}
              options={methods}
              selectedValues={
                new Set(
                  table?.getColumn('method')?.getFilterValue() as string[]
                )
              }
              title="Method"
            />
          )}
        {availableColumnIds.includes('duration_type') &&
          table?.getColumn('duration_type') && (
            <MultiSelectFilter
              onValueChange={(values) => {
                table?.getColumn('duration_type')?.setFilterValue(values);
              }}
              options={duration_types}
              selectedValues={
                new Set(
                  table
                    ?.getColumn('duration_type')
                    ?.getFilterValue() as string[]
                )
              }
              title="Duration Types"
            />
          )}
        {isFiltered && (
          <Button
            className="h-8 px-2 lg:px-3"
            onClick={() => {
              _setQueryFilterSearch(null, {
                shallow: false,
              });
              table?.resetColumnFilters();
            }}
            variant="ghost"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
