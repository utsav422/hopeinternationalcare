'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/components/Custom/data-table';
import type { RefundWithDetails } from '@/lib/server-actions/admin/refunds';

const columns: ColumnDef<RefundWithDetails>[] = [
  {
    accessorKey: 'userName',
    header: 'User Name',
  },
  {
    accessorKey: 'userEmail',
    header: 'User Email',
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
    accessorKey: 'reason',
    header: 'Reason',
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

export function RefundsTable({
  data,
  total,
}: {
  data: RefundWithDetails[];
  total: number;
}) {
  return (
    <DataTable columns={columns} data={data} title="Refunds" total={total} />
  );
}
