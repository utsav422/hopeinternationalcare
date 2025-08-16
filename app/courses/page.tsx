import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { getPublicCourses } from '@/lib/server-actions/public/courses';
import { publicGetAllCatogies } from '@/lib/server-actions/public/courses-categories';
import { getAllIntakes } from '@/lib/server-actions/public/intakes';
import { getQueryClient } from '@/utils/get-query-client';
import { AllCourses } from './_components/courses';

export const metadata: Metadata = {
    title: 'Our Courses | Hope International',
    description:
        'Explore the wide range of courses we offer at Hope International. We provide comprehensive training for caregivers, including specialized courses for various levels of care.',
    openGraph: {
        title: 'Our Courses | Hope International',
        description:
            'Explore the wide range of courses we offer at Hope International. We provide comprehensive training for caregivers, including specialized courses for various levels of care.',
        url: 'https://hopeinternational.com.np/courses',
        images: [
            {
                url: '/opengraph-image.png',
                width: 1200,
                height: 630,
            },
        ],
    },
};

export default async function Courses() {
    const queryClient = getQueryClient();

    // Prefetch initial courses data with default parameters
    await queryClient.prefetchInfiniteQuery({
        queryKey: queryKeys.publicCourses.list({
            pageSize: 9,
            filters: {},
            sortBy: 'created_at',
            sortOrder: 'desc'
        }),
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getPublicCourses({
                page: pageParam,
                pageSize: 9,
                filters: {},
                sortBy: 'created_at',
                sortOrder: 'desc'
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch courses');
            }

            return result;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages: any[]) => {
            if (lastPage.data && lastPage.data.length < 9) {
                return undefined;
            }
            if (lastPage.data && lastPage.data.length > 0) {
                return allPages.length + 1;
            }
            return undefined;
        },
    });

    // Prefetch intakes for filters
    await queryClient.prefetchQuery({
        queryKey: queryKeys.intakes.all,
        queryFn: async () => {
            const result = await getAllIntakes();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        },
    });

    // Prefetch categories for filters
    await queryClient.prefetchQuery({
        queryKey: queryKeys.courseCategories.all,
        queryFn: async () => {
            const result = await publicGetAllCatogies();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch categories');
            }
            return result;
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={'Loading ...'}>
                <AllCourses />
            </Suspense>
        </HydrationBoundary>
    );
}
