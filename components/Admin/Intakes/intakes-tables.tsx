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
  const { data: queryResult, isLoading } = useGetAllIntakes();
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
      header: 'Course Title',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({
        row,
      }: {
        row: { original: IntakeWithCourseTitleWithPrice };
      }) => (
        <span>{new Date(row.original.start_date).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({
        row,
      }: {
        row: { original: IntakeWithCourseTitleWithPrice };
      }) => <span>{new Date(row.original.end_date).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
    },
    {
      accessorKey: 'total_registered',
      header: 'Total Registered',
    },
    {
      accessorKey: 'is_open',
      header: 'Is Open',
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
            <Button size="sm" variant="ghost">
              ...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/admin/intakes/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/intakes/edit/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)}>
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
      <TabsList>
        <TabsTrigger value="current">Current Intakes</TabsTrigger>
        <TabsTrigger value="history">History Intakes</TabsTrigger>
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
