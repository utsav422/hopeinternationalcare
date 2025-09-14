import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CourseDetailsCard from '@/components/Admin/Courses/course-details-card';
import { queryKeys } from '@/lib/query-keys';
import { getCachedPublicCourseBySlug } from '@/lib/server-actions/public/courses';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { cachedAdminCourseDetailsById } from '@/lib/server-actions/admin/courses';
import { adminCourseCategoryDetailsById, adminCourseCategoryList, adminCourseCategoryListAll } from '@/lib/server-actions/admin/course-categories';
import { notFound } from 'next/navigation';
import { adminIntakesByCourseAndYear } from '@/lib/server-actions/admin/intakes';

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
    const response = await cachedAdminCourseDetailsById(id)
    if (!response.success) {
        notFound()
    }
    const category_id = response.data?.category_id as string

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.courses.detail(id),
            queryFn: () => response,
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.courseCategories.lists(),
            queryFn: adminCourseCategoryListAll
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.intakes.list({
                filters: [{ course_id: id, year: new Date().getFullYear().toString() }]
            }),
            queryFn: () => adminIntakesByCourseAndYear(id, new Date().getFullYear().toString())
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.courseCategories.detail(category_id),
            queryFn: async () => await adminCourseCategoryDetailsById(category_id)
        })
    ])
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
