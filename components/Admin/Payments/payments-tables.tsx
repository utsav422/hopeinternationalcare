'use client';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeletePayment, useGetPayments } from '@/hooks/admin/payments';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import type { PaymentDetailsType } from '@/lib/db/drizzle-zod-schema/payments';

export default function PaymentsTables() {
    const searchParams = useSearchParams();
    const queryState = useDataTableQueryState();
    const { data: queryResult, error } = useGetPayments({ ...queryState });
    if (error) {
        toast.error('Error fetching categories', {
            description: error.message,
        });
    }
    const data = queryResult?.data as PaymentDetailsType[];
    const total = queryResult?.total ?? 0;
    const _router = useRouter();
    const status = searchParams.get('status');
    const { mutateAsync: deletePayment } = useDeletePayment();

    const handleDelete = async (id: string) => {
         toast.promise(deletePayment(id), {
            loading: 'Deleting payment...',
            success: 'Payment deleted successfully',
             error: (error) => error instanceof Error ? error.message : 'Failed to delete payment',
        });
    };
    const columns: ColumnDef<PaymentDetailsType & { id: UniqueIdentifier }>[] = [
        {
            accessorKey: 'id',
            header: () => <div className="">Payment ID</div>,
            cell: ({ row }) => (
                <div className="dark:text-gray-300">{row.getValue('id')}</div>
            ),
        },
        {
            accessorKey: 'userEmail',
            header: () => <div className="">Email</div>,
            cell: (props) => {
                return (
                    <div className="dark:text-gray-300">
                        {props.row.original.userEmail}
                    </div>
                );
            },
        },
        {
            accessorKey: 'courseTitle',
            header: () => <div className="">Course</div>,
            cell: (props) => {
                return (
                    <div className="dark:text-gray-300">
                        {props.row.original.courseTitle}
                    </div>
                );
            },
        },
        {
            accessorKey: 'enrolled_at',
            header: () => <div className="">Enrolled Date</div>,
            cell: (props) => {
                const date = new Date(props.row.original.enrolled_at ?? '');

                return (
                    <div className="dark:text-gray-300">{date.toLocaleDateString()}</div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: () => <div className="">Status</div>,
            cell: (props) => {
                const status = props.row.original.status;
                return <div className="dark:text-gray-300">{status}</div>;
            },
        },
        {
            accessorKey: 'amount',
            header: () => <div className="">Amount (NPR)</div>,
        },
        {
            accessorKey: 'remarks',
            header: () => <div className="">Remark</div>,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0 " variant="ghost">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className=""
                    >
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/admin/payments/${row.original.id}`}
                            >
                                View
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/admin/payments/edit/${row.original.id}`}
                            >
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="dark:text-red-500 dark:hover:bg-gray-700"
                            onClick={() => handleDelete(row.original.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];
    return (
        <div className="space-y-4">
            <Card className="">
                <CardHeader />
                <CardContent>
                    <DataTable<PaymentDetailsType, unknown>
                        columns={columns}
                        data={data ?? []}
                        headerActionUrl="/admin/payment/new"
                        headerActionUrlLabel={'Create Payment '}
                        title={`${status} Payment Management`}
                        total={total}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
