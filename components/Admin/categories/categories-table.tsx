'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useGetCourseCategories } from '../../../hooks/course-categories';
import { useDataTableQueryState } from '../../../hooks/use-data-table-query-state';
import { adminDeleteCourseCategories } from '../../../server-actions/admin/courses-categories';
import type { ZTSelectCourseCategories } from '../../../utils/db/drizzle-zod-schema/course-categories';
import type { SelectCourseCategory } from '../../../utils/db/schema/course-categories';
import { CategoriesTableActions } from './categories-table-actions';

export default function CategoriesTable() {
  const router = useRouter();
  const queryState = useDataTableQueryState();

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
          router.refresh();
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
    <Card>
      <CardHeader />
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
