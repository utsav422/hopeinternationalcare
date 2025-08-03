'use client';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { ColumnDef, Row } from '@tanstack/react-table';
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
import { useDeletePayment, useGetPayments } from '@/hooks/payments';
import { useDataTableQueryState } from '@/hooks/use-data-table-query-state';
import type { PaymentDetailsType } from '@/utils/db/drizzle-zod-schema/payments';

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
    await toast.promise(deletePayment(id), {
      loading: 'Deleting payment...',
      success: 'Payment deleted successfully',
      error: 'Failed to delete payment',
    });
  };
  const columns: ColumnDef<PaymentDetailsType & { id: UniqueIdentifier }>[] = [
    {
      accessorKey: 'id',
      header: 'Payment ID',
    },
    {
      accessorKey: 'userEmail',
      header: 'Email',
      cell: (props) => {
        return props.row.original.userEmail;
      },
    },
    {
      accessorKey: 'courseTitle',
      header: 'Course',
      cell: (props) => {
        return props.row.original.courseTitle;
      },
    },
    {
      accessorKey: 'enrolled_at',
      header: 'Enrolled Date',
      cell: ({
        row,
      }: {
        row: Row<PaymentDetailsType & { id: UniqueIdentifier }>;
      }) => {
        const date = new Date(row.getValue('enrolled_at'));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({
        row,
      }: {
        row: Row<PaymentDetailsType & { id: UniqueIdentifier }>;
      }) => {
        const status = row.getValue('status');
        return status;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount (NPR)',
      cell: ({
        row,
      }: {
        row: Row<PaymentDetailsType & { id: UniqueIdentifier }>;
      }) => {
        const status = row.getValue('amount');
        return status;
      },
    },
    {
      accessorKey: 'remarks',
      header: 'Remark',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/payments/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/payments/edit/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  return (
    <div className="space-y-4">
      <Card>
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
