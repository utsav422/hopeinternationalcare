import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CourseDetailsCard from '@/components/Admin/Courses/course-details-card';
import { queryKeys } from '@/lib/query-keys';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { cachedAdminCourseDetails } from '@/lib/server-actions/admin/courses-optimized';
import {
    adminCourseCategoryDetails,
    adminCourseCategoryList,
} from '@/lib/server-actions/admin/course-categories-optimized';
import { notFound } from 'next/navigation';
import { adminIntakeList } from '@/lib/server-actions/admin/intakes-optimized';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Courses(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    await requireAdmin();

    const params = await props.params;
    const id = params.id;

    const queryClient = getQueryClient();
    const response = await cachedAdminCourseDetails(id);
    if (!response.success) {
        notFound();
    }
    const category_id = response.data?.category?.id as string;

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.courses.detail(id),
            queryFn: () => response,
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.courseCategories.lists(),
            queryFn: () => adminCourseCategoryList({ page: 1, pageSize: 9999 }),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.intakes.list({
                filters: [
                    {
                        course_id: id,
                        year: new Date().getFullYear().toString(),
                    },
                ],
            }),
            queryFn: () =>
                adminIntakeList({
                    page: 1,
                    pageSize: 9999,
                    filters: [{ id: 'course_id', value: id }],
                }),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.courseCategories.detail(category_id),
            queryFn: async () => await adminCourseCategoryDetails(category_id),
        }),
    ]);
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <CourseDetailsCard />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
