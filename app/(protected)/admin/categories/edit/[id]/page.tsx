import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CategoryForm from '@/components/Admin/categories/category-form';
import { queryKeys } from '@/lib/query-keys';
import { getCachedAdminCourseCategoriesById } from '@/lib/server-actions/admin/courses-categories';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function EditCategoryPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await props.params;
  const id = params.id;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.courseCategories.detail(id),
    queryFn: () => getCachedAdminCourseCategoriesById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback="Loading...">
        <CategoryForm formTitle="Course Edit form " id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
