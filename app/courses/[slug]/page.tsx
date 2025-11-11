import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { queryKeys } from '@/lib/query-keys';
import {
    getCachedPublicCourseBySlug,
    getCachedRelatedCourses,
} from '@/lib/server-actions/public/courses-optimized';
import { getQueryClient } from '@/utils/get-query-client';
import CourseDetails from './_components';
import { Suspense } from 'react';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { getCachedCourseActiveIntakes } from '@/lib/server-actions/public/intakes-optimized';
import { notFound } from 'next/navigation';
import { generateCourseMetadata } from '@/lib/seo/metadata';
import {
    CourseStructuredData,
    BreadcrumbStructuredData,
} from '@/components/SEO/StructuredData';

interface CourseDetailPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(
    props: CourseDetailPageProps
): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;
    const courseData = await getCachedPublicCourseBySlug(slug);

    if (!courseData?.data) {
        return {};
    }

    return generateCourseMetadata(courseData.data);
}

export default async function CourseDetailPage({
    params,
}: CourseDetailPageProps) {
    const { slug } = await params;
    const queryClient = getQueryClient();

    // 1. Fetch course directly so you have data for dependent queries
    const courseResponse = await getCachedPublicCourseBySlug(slug);

    if (!(courseResponse?.data?.category_id && courseResponse?.data?.id)) {
        notFound();
    }

    const { id, category_id } = courseResponse.data;

    // 2. Prefetch everything in parallel
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.publicCourses.detail(slug),
            queryFn: async () => courseResponse, // reuse already fetched data
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.intakes.list({
                filters: [{ course_id: id }],
            }),
            queryFn: async () => await getCachedCourseActiveIntakes(id),
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.relatedCourses.detail(id, category_id),
            queryFn: async () => await getCachedRelatedCourses(id, category_id),
        }),
    ]);

    // Breadcrumb data
    const breadcrumbs = [
        { name: 'Home', url: 'https://hopeinternational.com.np' },
        { name: 'Courses', url: 'https://hopeinternational.com.np/courses' },
        {
            name: courseResponse.data.title,
            url: `https://hopeinternational.com.np/courses/${slug}`,
        },
    ];

    return (
        <>
            <CourseStructuredData course={courseResponse.data} />
            <BreadcrumbStructuredData items={breadcrumbs} />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <QueryErrorWrapper>
                    <Suspense fallback={<>Loading ...</>}>
                        <CourseDetails />
                    </Suspense>
                </QueryErrorWrapper>
            </HydrationBoundary>
        </>
    );
}
