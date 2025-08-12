'use client';

import { useGetUserPaymentHistory } from '@/hooks/user/user-payments';
import { PaymentHistoryTable } from './payment-history-table-component';

export default function PaymentHistoryTableContainer({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}) {
  const { data, isLoading, error } = useGetUserPaymentHistory(page, pageSize);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <PaymentHistoryTable data={data || []} />;
}
