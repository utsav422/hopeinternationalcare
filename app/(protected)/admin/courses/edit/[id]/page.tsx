'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CourseFormModal from '@/components/Admin/Courses/course-form';
import { queryKeys } from '@/lib/query-keys';
import { cachedAdminCourseDetails } from '@/lib/server-actions/admin/courses-optimized';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { adminCourseCategoryList } from '@/lib/server-actions/admin/course-categories-optimized';
import { adminAffiliationsAll } from '@/lib/server-actions/admin/affiliations-optimized';
type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function EditCourse(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    await requireAdmin();

    const params = await props.params;
    const id = params.id;

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: queryKeys.courses.detail(id),
        queryFn: () => cachedAdminCourseDetails(id),
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
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <CourseFormModal formTitle="Edit Course Form" id={id} />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
