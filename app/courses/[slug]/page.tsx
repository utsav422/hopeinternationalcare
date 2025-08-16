import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { queryKeys } from '@/lib/query-keys';
import { getCachedPublicCourseBySlug, getCachedRelatedCourses, getPublicCourseBySlug, getRelatedCourses } from '@/lib/server-actions/public/courses';
import { getQueryClient } from '@/utils/get-query-client';
import CourseDetails from './_components';
import { Suspense } from 'react';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { getActiveIntakesByCourseId, getCachedCourseActiveIntakes } from '@/lib/server-actions/public/intakes';
import { notFound } from 'next/navigation';

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
    const course = courseData.data;
    return {
        title: `${course.title} | Hope International`,
        description: course.description,
        openGraph: {
            title: `${course.title} | Hope International`,
            description: course.description || '',
            url: `https://hopeinternational.com.np/courses/${course.slug}`,
            images: [
                {
                    url: course.image_url || '/opengraph-image.png',
                    width: 1200,
                    height: 630,
                },
            ],
        },
    };
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
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback={<>Loading ...</>}>
                    <CourseDetails />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
