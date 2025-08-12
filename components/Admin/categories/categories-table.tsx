'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  useDeleteCourseCategory,
  useGetCourseCategories,
} from '@/hooks/admin/course-categories';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import type { ZodSelectCourseCategoryType } from '@/lib/db/drizzle-zod-schema/course-categories';
import { CategoriesTableActions } from './categories-table-actions';

export default function CategoriesTable() {
  const router = useRouter();
  const queryState = useDataTableQueryState();
  const _queryClient = useQueryClient();

  const { data: queryResult, error } = useGetCourseCategories({
    ...queryState,
  });

  const { mutateAsync: deleteCategory } = useDeleteCourseCategory();

  const data = queryResult?.data;
  const total = queryResult?.total;

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm('Are you sure you want to delete this category?')) {
        return;
      }

      const promise = deleteCategory(id);

      toast.promise(promise, {
        loading: 'Deleting category...',
        success: 'Category deleted successfully',
        error: 'Failed to delete category',
      });
    },
    [router]
  );

  const columns: ColumnDef<ZodSelectCourseCategoryType>[] = useMemo(
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

  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <CardHeader className="dark:border-gray-700 dark:border-b" />
      <CardContent>
        <DataTable<ZodSelectCourseCategoryType, unknown>
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
