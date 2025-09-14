import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Suspense} from 'react';
import CategoryForm from '@/components/Admin/categories/category-form';
import {queryKeys} from '@/lib/query-keys';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';

export default async function NewCategoryPage() {
    await requireAdmin();

    const queryClient = getQueryClient();

    // Prefetch empty category data for a new form
    await queryClient.prefetchQuery({
        queryKey: queryKeys.courseCategories.detail(''),
        queryFn: () => Promise.resolve({data: null, success: true, error: ''}),
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <CategoryForm formTitle="Create new Category" id={'new'}/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
