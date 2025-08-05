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
import { useDeleteIntake, useGetAllIntakes } from '@/hooks/intakes';
import type { IntakeWithCourseTitleWithPrice } from '@/server-actions/admin/intakes';
import { DataTable } from '../../Custom/data-table';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';

export default function IntakesTables() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const { data: queryResult, isLoading, error } = useGetAllIntakes();
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
      header: () => <div className="dark:text-white">Course Title</div>,
      cell: ({ row }: { row: { original: IntakeWithCourseTitleWithPrice } }) => (
        <span className="dark:text-gray-300">{row.original.courseTitle}</span>
      ),
    },
    {
      accessorKey: 'start_date',
      header: () => <div className="dark:text-white">Start Date</div>,
      cell: ({
        row,
      }: {
        row: { original: IntakeWithCourseTitleWithPrice };
      }) => (
        <span className="dark:text-gray-300">{new Date(row.original.start_date).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: 'end_date',
      header: () => <div className="dark:text-white">End Date</div>,
      cell: ({
        row,
      }: {
        row: { original: IntakeWithCourseTitleWithPrice };
      }) => <span className="dark:text-gray-300">{new Date(row.original.end_date).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'capacity',
      header: () => <div className="dark:text-white">Capacity</div>,
      cell: ({ row }: { row: { original: IntakeWithCourseTitleWithPrice } }) => (
        <span className="dark:text-gray-300">{row.original.capacity}</span>
      ),
    },
    {
      accessorKey: 'total_registered',
      header: () => <div className="dark:text-white">Total Registered</div>,
      cell: ({ row }: { row: { original: IntakeWithCourseTitleWithPrice } }) => (
        <span className="dark:text-gray-300">{row.original.total_registered}</span>
      ),
    },
    {
      accessorKey: 'is_open',
      header: () => <div className="dark:text-white">Is Open</div>,
      cell: ({ row }: { row: { original: IntakeWithCourseTitleWithPrice } }) => (
        <span className="dark:text-gray-300">{row.original.is_open ? 'Yes' : 'No'}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({
        row,
      }: {
        row: { original: IntakeWithCourseTitleWithPrice };
      }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="dark:text-white">
              ...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuItem asChild>
              <Link href={`/admin/intakes/${row.original.id}`} className="dark:text-gray-300 dark:hover:bg-gray-700">View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/intakes/edit/${row.original.id}`} className="dark:text-gray-300 dark:hover:bg-gray-700">Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="dark:text-red-500 dark:hover:bg-gray-700">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Tabs defaultValue={tab ?? 'current'}>
      <TabsList className="dark:bg-gray-800 dark:border-gray-700">
        <TabsTrigger value="current" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Current Intakes</TabsTrigger>
        <TabsTrigger value="history" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">History Intakes</TabsTrigger>
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
