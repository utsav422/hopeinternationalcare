'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeleteIntake, useGetIntakes } from '@/hooks/admin/intakes';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import type { IntakeWithCourse } from '@/server-actions/admin/intakes';
import { DataTable } from '../../Custom/data-table';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';

function IntakesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function IntakesTables() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const queryState = useDataTableQueryState();

  const {
    data: queryResult,
    isLoading,
    error,
  } = useGetIntakes({ ...queryState });
  if (error) {
    toast.error('Error fetching intakes', {
      description: error.message,
    });
  }
  const data = queryResult?.data;
  const { mutateAsync: deleteIntake } = useDeleteIntake();

  const currentYear = new Date().getFullYear();
  const currentIntakes = data?.filter((intake) => {
    return new Date(intake.start_date).getFullYear() === currentYear;
  });
  const currentTotal = currentIntakes?.length ?? 0;
  const historyIntakes = data?.filter((intake) => {
    return new Date(intake.start_date).getFullYear() !== currentYear;
  });
  const historyTotal = historyIntakes?.length ?? 0;

  const handleDelete = async (id: string) => {
    await toast.promise(deleteIntake(id), {
      loading: 'Deleting intake...',
      success: 'Intake deleted successfully',
      error: 'Failed to delete intake',
    });
  };

  const columns = [
    {
      accessorKey: 'courseTitle',
      header: () => (
        <div className="text-gray-800 dark:text-white">Course Title</div>
      ),
      cell: ({ row }: { row: { original: IntakeWithCourse } }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.courseTitle}
        </span>
      ),
    },
    {
      accessorKey: 'start_date',
      header: () => (
        <div className="text-gray-800 dark:text-white">Start Date</div>
      ),
      cell: ({ row }: { row: { original: IntakeWithCourse } }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {new Date(row.original.start_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'end_date',
      header: () => (
        <div className="text-gray-800 dark:text-white">End Date</div>
      ),
      cell: ({ row }: { row: { original: IntakeWithCourse } }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {new Date(row.original.end_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'capacity',
      header: () => (
        <div className="text-gray-800 dark:text-white">Capacity</div>
      ),
      cell: ({ row }: { row: { original: IntakeWithCourse } }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.capacity}
        </span>
      ),
    },
    {
      accessorKey: 'total_registered',
      header: () => (
        <div className="text-gray-800 dark:text-white">Total Registered</div>
      ),
      cell: ({ row }: { row: { original: IntakeWithCourse } }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.total_registered}
        </span>
      ),
    },
    {
      accessorKey: 'is_open',
      header: () => (
        <div className="text-gray-800 dark:text-white">Is Open</div>
      ),
      cell: ({ row }: { row: { original: IntakeWithCourse } }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.is_open ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: IntakeWithCourse } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="text-gray-800 dark:text-white"
              size="sm"
              variant="ghost"
            >
              ...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark:border-gray-700 dark:bg-gray-800">
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                href={`/admin/intakes/${row.original.id}`}
              >
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                className="cursor-pointer text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                href={`/admin/intakes/edit/${row.original.id}`}
              >
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 dark:text-red-500 dark:hover:bg-gray-700"
              onClick={() => handleDelete(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <IntakesTableSkeleton />;
  }

  return (
    <Tabs defaultValue={tab ?? 'current'}>
      <TabsList className="dark:border-gray-700 dark:bg-gray-800/50">
        <TabsTrigger
          className="text-gray-800 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
          value="current"
        >
          Current Intakes
        </TabsTrigger>
        <TabsTrigger
          className="text-gray-800 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
          value="history"
        >
          History Intakes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <DataTable
          columns={columns}
          data={currentIntakes ?? []}
          headerActionUrl="/admin/intakes/new"
          headerActionUrlLabel="Create New"
          total={currentTotal}
        />
      </TabsContent>
      <TabsContent value="history">
        <DataTable
          columns={columns}
          data={historyIntakes ?? []}
          headerActionUrl="/admin/intakes/new"
          headerActionUrlLabel="Create New"
          total={historyTotal}
        />
      </TabsContent>
    </Tabs>
  );
}
