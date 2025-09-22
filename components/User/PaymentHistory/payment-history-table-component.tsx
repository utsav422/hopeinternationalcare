'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/components/Custom/data-table';
import type { UserPaymentHistory } from '@/lib/types/user/payments';

const columns: ColumnDef<UserPaymentHistory>[] = [
  {
    accessorKey: 'courseName',
    header: 'Course',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NPR',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'paid_at',
    header: 'Paid At',
    cell: ({ row }) => {
      const date = row.getValue('paid_at') as string | null;
      if (!date) {
        return null;
      }
      return format(new Date(date), 'PPP');
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return format(date, 'PPP');
    },
  },
];

export function PaymentHistoryTable({ data, total }: { data: UserPaymentHistory[], total: number }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      title="Payment History"
      total={total}
    />
  );
}
