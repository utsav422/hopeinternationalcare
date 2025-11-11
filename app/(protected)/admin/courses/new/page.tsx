'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import CourseForm from '@/components/Admin/Courses/course-form';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { queryKeys } from '@/lib/query-keys';
import { adminCourseCategoryList } from '@/lib/server-actions/admin/course-categories-optimized';
import { adminAffiliationsAll } from '@/lib/server-actions/admin/affiliations-optimized';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { Suspense } from 'react';

export default async function NewCourse() {
    await requireAdmin();

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: queryKeys.courses.detail(''),
        queryFn: () =>
            Promise.resolve({ data: null, success: true, error: '' }),
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.courseCategories.lists(),
        queryFn: () => adminCourseCategoryList({ page: 1, pageSize: 9999 }),
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.affiliations.lists(),
        queryFn: adminAffiliationsAll,
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback="Loading...">
                <CourseForm formTitle="Create New Course Form" />
            </Suspense>
        </HydrationBoundary>
    );
}
