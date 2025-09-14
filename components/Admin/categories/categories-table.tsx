'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    useAdminCourseCategoryDeleteById,
    useAdminCourseCategoryList,
} from '@/hooks/admin/course-categories';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import type { ZodSelectCourseCategoryType } from '@/lib/db/drizzle-zod-schema/course-categories';
import { CategoriesTableActions } from './categories-table-actions';

export default function CategoriesTable() {
    const router = useRouter();
    const queryState = useDataTableQueryState();
    console.log({ queryState })
    const { data: queryResult, error } = useAdminCourseCategoryList({
        ...queryState,
        filters: queryState?.filters ?? []
    });

    const { mutateAsync: deleteCategory } = useAdminCourseCategoryDeleteById();

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
                error: (error) => error instanceof Error ? error.message : 'Failed to delete category',
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
                        onDeleteAction={handleDelete}
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
        <Card >
            <CardHeader />
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
