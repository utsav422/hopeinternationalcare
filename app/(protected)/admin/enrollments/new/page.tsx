'use server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import EnrollmentFormModal from '@/components/Admin/Enrollments/enrollment-form';
import { queryKeys } from '@/lib/query-keys';
import { adminCourseListAll } from '@/lib/server-actions/admin/courses-optimized';
import { adminUserList } from '@/lib/server-actions/admin/users';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function NewEnrollement() {
    await requireAdmin();

    const queryClient = getQueryClient();

    // Prefetch empty enrollment data and dependencies for new form
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.enrollments.detail(''),
            queryFn: () => Promise.resolve({ data: null, success: false, error: '' }),
            staleTime: 1000 * 60 * 5,  //5minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.courses.lists(),
            queryFn: adminCourseListAll,
            staleTime: 1000 * 60 * 5,  //5minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.users.list({ page: 1, pageSize: 100 }),
            queryFn: () => adminUserList(1, 100),
            staleTime: 1000 * 60 * 5,  //5minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        })
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <EnrollmentFormModal formTitle="Create New Enrollment" />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
