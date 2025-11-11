import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CategoryForm from '@/components/Admin/categories/category-form';
import { queryKeys } from '@/lib/query-keys';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { redirect } from 'next/navigation';

// Define constants for cache times
const STALE_TIME_5_MINUTES = 1000 * 60 * 5; // 5 minutes
const GC_TIME_1_HOUR = 1000 * 60 * 60; // 1 hour

export default async function NewCategoryPage() {
    // Check if user has admin access
    try {
        await requireAdmin();
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories/new');
    }

    const queryClient = getQueryClient();

    // Prefetch empty category data for a new form
    // Using a more explicit response structure that matches the expected API response format
    await queryClient.prefetchQuery({
        queryKey: queryKeys.courseCategories.detail(''),
        queryFn: () =>
            Promise.resolve({
                data: null,
                success: true,
                error: null,
            }),
        staleTime: STALE_TIME_5_MINUTES,
        gcTime: GC_TIME_1_HOUR,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense
                    fallback={
                        <div className="p-8 text-center">
                            Loading category form...
                        </div>
                    }
                >
                    <CategoryForm formTitle="Create New Category" />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
