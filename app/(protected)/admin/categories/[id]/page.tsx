import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { queryKeys } from '@/lib/query-keys';
import { getCachedAdminCourseCategoriesById } from '@/lib/server-actions/admin/courses-categories';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default async function CategoryDetailsPage(props: {
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

  const result = await getCachedAdminCourseCategoriesById(id);
  const data = result.success ? result.data : null;

  if (!data) {
    return <p>Category not found.</p>;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Description:</strong> {data.description}
          </p>
          <p>
            <strong>created at:</strong> {data.created_at}
          </p>
        </CardContent>
      </Card>
    </HydrationBoundary>
  );
}
