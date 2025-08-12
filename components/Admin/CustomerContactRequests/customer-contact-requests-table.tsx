'use client';

import { Suspense } from 'react';
import { useGetCustomerContactRequests } from '@/hooks/admin/customer-contact-requests';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import { CustomerContactRequestsTable } from './customer-contact-requests-table-component';

export default function CustomerContactRequestsTableContainer() {
  const { page, pageSize, filters } = useDataTableQueryState();

  // Extract search and status from filters
  const search = filters.find(
    (f: { id: string; value: unknown }) => f.id === 'search'
  )?.value as string | undefined;
  const status = filters.find(
    (f: { id: string; value: unknown }) => f.id === 'status'
  )?.value as string | undefined;

  const { data } = useGetCustomerContactRequests({
    page,
    pageSize,
    search,
    status,
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerContactRequestsTable
        data={data?.data || []}
        total={data?.total || 0}
      />
    </Suspense>
  );
}
