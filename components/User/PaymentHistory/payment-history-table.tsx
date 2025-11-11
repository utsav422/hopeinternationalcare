'use client';

import { useGetUserPaymentHistory } from '@/hooks/user/user-payments-optimized';
import { PaymentHistoryTable } from './payment-history-table-component';

export default function PaymentHistoryTableContainer({
    page = 1,
    pageSize = 10,
    userId,
}: {
    page?: number;
    pageSize?: number;
    userId: string;
}) {
    const {
        data: queryResult,
        isLoading,
        error,
    } = useGetUserPaymentHistory(page, pageSize, userId);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const data = queryResult?.data || [];
    const total = queryResult?.total || 0;

    return <PaymentHistoryTable data={data} total={total} />;
}
