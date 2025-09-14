'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAdminAffiliationDelete, useAdminAffiliations } from '@/hooks/admin/affiliations';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import type { ZodSelectAffiliationType } from '@/lib/db/drizzle-zod-schema/affiliations';
import { AffiliationsTableActions } from './affiliations-table-actions';

export default function AffiliationsTable() {
    const queryState = useDataTableQueryState();
    const queryClient = useQueryClient();
    const { data: queryResult, error } = useAdminAffiliations({
        ...queryState,
        filters: queryState?.filters ?? []
    });

    const { mutateAsync: deleteAffiliation } = useAdminAffiliationDelete();

    const data = queryResult?.data;
    const total = queryResult?.total;

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this affiliation? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await deleteAffiliation(id);
            if (result.success) {
                toast.success('Affiliation deleted successfully');
                // Invalidate queries to refresh the table
                await queryClient.invalidateQueries({
                    queryKey: ['affiliations'],
                });
            } else {
                // Check if the error is due to foreign key constraint
                if (result.error && result.error.includes('referenced')) {
                    toast.error('Cannot delete affiliation', {
                        description: result.error
                    });
                } else {
                    toast.error('Failed to delete affiliation', {
                        description: result.error || 'An unknown error occurred'
                    });
                }
            }
        } catch (error) {
            toast.error('Error deleting affiliation', {
                description: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };

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