'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/components/Custom/data-table';

type PaymentHistory = {
  paymentId: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  intake_id: string | null;
  courseId: string | null;
  courseName: string | null;
};

const columns: ColumnDef<PaymentHistory>[] = [
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

export function PaymentHistoryTable({ data }: { data: PaymentHistory[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      title="Payment History"
      total={data.length}
    />
  );
}
