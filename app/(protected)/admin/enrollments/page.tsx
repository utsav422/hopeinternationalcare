'use server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import EnrollmentsTable from '@/components/Admin/Enrollments/enrollment-tables';
import { queryKeys } from '@/lib/query-keys';
import { adminGetEnrollments } from '@/lib/server-actions/admin/enrollments';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

type SearchParams = {
    page?: string;
    pageSize?: string;
    filters?: string;
};

export default async function EnrollmentsPage(props: {
    searchParams: Promise<SearchParams>;
}) {
    const queryClient = getQueryClient();
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const pageSize = Number(searchParams.pageSize) || 10;
    const filters = searchParams.filters ? JSON.parse(searchParams.filters) : [];

    await queryClient.prefetchQuery({
        queryKey: queryKeys.enrollments.list({ page, pageSize, filters }),
        queryFn: () => adminGetEnrollments({ page, pageSize, filters }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <EnrollmentsTable />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
