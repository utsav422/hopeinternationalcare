'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    useAdminAffiliationDelete,
    useAdminAffiliationList,
} from '@/hooks/admin/affiliations-optimized';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import type { ZodSelectAffiliationType } from '@/lib/db/drizzle-zod-schema/affiliations';
import { AffiliationsTableActions } from './affiliations-table-actions';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AffiliationsTable() {
    const router = useRouter();
    const queryState = useDataTableQueryState();
    const queryClient = useQueryClient();
    const { data: queryResult, error } = useAdminAffiliationList({
        ...queryState,
        filters: queryState?.filters ?? [],
    });

    const { mutateAsync: deleteAffiliation } = useAdminAffiliationDelete();

    const data = queryResult?.data?.data;
    const total = queryResult?.data?.total;
    const page = queryResult?.data?.page;
    const pageSize = queryResult?.data?.pageSize;

    const handleDelete = useCallback(
        (id: string) => {
            const consent = confirm(
                'Are you sure you want to delete this affiliation? This action cannot be undone.'
            );
            if (!consent) {
                return;
            }

            try {
                const promise = deleteAffiliation(id);
                toast.promise(promise, {
                    loading: 'Deleting Affiliation...',
                    success: 'Affiliation deleted successfully',
                    error: error =>
                        error instanceof Error
                            ? error.message
                            : 'Failed to delete Affiliation',
                });
            } catch (error) {
                toast.error('Error deleting affiliation', {
                    description:
                        error instanceof Error
                            ? error.message
                            : 'An unknown error occurred',
                });
            }
        },
        [deleteAffiliation]
    );

    const columns: ColumnDef<ZodSelectAffiliationType>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'type',
            header: 'Type',
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
                <AffiliationsTableActions
                    id={row.original.id}
                    onDeleteAction={handleDelete}
                />
            ),
        },
    ];

    if (error) {
        toast.error('Error fetching affiliations', {
            description: error.message,
        });
    }

    return (
        <Card>
            <CardHeader />
            <CardContent>
                <DataTable<ZodSelectAffiliationType, unknown>
                    columns={columns}
                    data={data ?? []}
                    headerActionUrl="/admin/affiliations/new"
                    headerActionUrlLabel="Create New"
                    title="Affiliations Management"
                    total={total ?? 0}
                />
            </CardContent>
        </Card>
    );
}
