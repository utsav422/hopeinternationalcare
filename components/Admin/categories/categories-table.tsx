'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useGetCourseCategories } from '../../../hooks/admin/course-categories';
import { useDataTableQueryState } from '../../../hooks/admin/use-data-table-query-state';
import { queryKeys } from '../../../lib/query-keys';
import { adminDeleteCourseCategories } from '../../../server-actions/admin/courses-categories';
import type { ZTSelectCourseCategories } from '../../../utils/db/drizzle-zod-schema/course-categories';
import type { SelectCourseCategory } from '../../../utils/db/schema/course-categories';
import { CategoriesTableActions } from './categories-table-actions';

export default function CategoriesTable() {
  const router = useRouter();
  const queryState = useDataTableQueryState();
  const queryClient = useQueryClient();

  const { data: queryResult, error } = useGetCourseCategories({
    ...queryState,
  });

  const data = queryResult?.data;
  const total = queryResult?.total;

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this category?')) {
        return;
      }

      const promise = adminDeleteCourseCategories(id);

      await toast.promise(promise, {
        loading: 'Deleting category...',
        success: () => {
          // Invalidate queries to refetch categories after successful deletion
          queryClient.invalidateQueries({
            queryKey: queryKeys.courseCategories.all,
          });
          return 'Category deleted successfully';
        },
        error: 'Failed to delete category',
      });
    },
    [router]
  );

  const columns: ColumnDef<ZTSelectCourseCategories>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
      },
      {
        accessorKey: 'updated_at',
        header: 'Last Updated At',
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <CategoriesTableActions
            id={row.original.id}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [handleDelete]
  );

  if (error) {
    toast.error('Error fetching categories', {
      description: error.message,
    });
  }
  // name: string;
  //   id: string;
  //   description: string | null;
  //   created_at: string;
  //   updated_at: string;
  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <CardHeader className="dark:border-gray-700 dark:border-b" />
      <CardContent>
        <DataTable<SelectCourseCategory, unknown>
          columns={columns}
          data={data ?? []}
          headerActionUrl="/admin/categories/new"
          headerActionUrlLabel="Create New"
          title="Categories Management"
          total={total ?? 0}
        />
      </CardContent>
    </Card>
  );
}
