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

    await queryClient.prefetchQuery({
        queryKey: queryKeys.publicCourses.list({ page: 1, pageSize: 10 }),
        queryFn: () => getPublicCourses({ page: 1, pageSize: 10 }),
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.intakes.all,
        queryFn: getAllIntakes,
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.courseCategories.all,
        queryFn: publicGetAllCatogies,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={'Loading ...'}>
                <AllCourses />
            </Suspense>
        </HydrationBoundary>
    );
}
