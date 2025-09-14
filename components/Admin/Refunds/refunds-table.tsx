'use client';

import {useAdminRefundList} from '@/hooks/admin/refunds';
import {useDataTableQueryState} from '@/hooks/admin/use-data-table-query-state';
import {RefundsTable} from './refunds-table-component';

export default function RefundsTableContainer() {
    const {page, pageSize, order, sortBy, filters} = useDataTableQueryState();

    // Extract search and status from filters
    const search = filters.find(
        (f: { id: string; value: unknown }) => f.id === 'search'
    )?.value as string | undefined;
    const status = filters.find(
        (f: { id: string; value: unknown }) => f.id === 'status'
    )?.value as string | undefined;

    const {data, isLoading, error} = useAdminRefundList({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        order,
        filters
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <RefundsTable data={data?.data || []} total={data?.total || 0}/>;
}
