'use client';

import {useGetUserPaymentHistory} from '@/hooks/user/user-payments';
import {PaymentHistoryTable} from './payment-history-table-component';

export default function PaymentHistoryTableContainer({
                                                         page = 1,
                                                         pageSize = 10,
                                                         userId
                                                     }: {
    page?: number;
    pageSize?: number;
    userId: string;
}) {
    const {data, isLoading, error} = useGetUserPaymentHistory(page, pageSize, userId);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <PaymentHistoryTable data={data || []}/>;
}
