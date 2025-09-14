import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { getCachedPublicCourses } from '@/lib/server-actions/public/courses';
import { getCachedPublicAllCategories } from '@/lib/server-actions/public/course-categories';
import { getCachedAllIntakes } from '@/lib/server-actions/public/intakes';
import { getQueryClient } from '@/utils/get-query-client';
import { AllCourses } from './_components/courses';
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo/metadata';
import { FAQStructuredData } from '@/components/SEO/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
    ...seoConfigs.courses,
    canonical: 'https://hopeinternational.com.np/courses',
});

// FAQ data for courses page
const coursesFAQ = [
    {
        question: 'What types of caregiver training courses do you offer?',
        answer: 'We offer comprehensive caregiver training packages including basic elderly care, advanced care techniques, specialized dementia care, and personalized career guidance. Our courses are designed to equip you with essential skills for elderly care.',
    },
    {
        question: 'How long are the training programs?',
        answer: 'Our training programs vary in duration from 1 month to 6 months depending on the course level and specialization. We offer flexible scheduling to accommodate different needs.',
    },
    {
        question: 'Do you provide certification upon completion?',
        answer: 'Yes, all our courses provide professional certification upon successful completion. Our certificates are recognized and help enhance your career prospects in elderly care.',
    },
    {
        question: 'What are the admission requirements?',
        answer: 'Basic literacy and a genuine interest in caring for elderly individuals are the primary requirements. No prior medical experience is necessary as we provide comprehensive training from the basics.',
    },
    {
        question: 'Do you offer job placement assistance?',
        answer: 'Yes, we provide personalized career guidance and support services to help our graduates find suitable employment opportunities in the elderly care sector.',
    },
    {
        question: 'What is the cost of the training programs?',
        answer: 'Course fees vary depending on the program duration and specialization. We offer competitive pricing and flexible payment options. Please contact us for detailed fee structure.',
    },
];

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
            const result = await getCachedPublicCourses({
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
            const result = await getCachedAllIntakes();
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
            const result = await getCachedPublicAllCategories();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch categories');
            }
            return result;
        },
    });

    return (
        <>
            <FAQStructuredData faqs={coursesFAQ} />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={'Loading ...'}>
                    <AllCourses />
                </Suspense>
            </HydrationBoundary>
        </>
    );
}
