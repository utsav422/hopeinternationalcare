import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import IntakeDetails from '@/components/Admin/Intakes/intake-details';
import { queryKeys } from '@/lib/query-keys';
import { adminGetIntakeById } from '@/server-actions/admin/intakes';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default async function IntakeDetailsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await props.params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.intakes.detail(params.id),
    queryFn: () => adminGetIntakeById(params.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IntakeDetails />
    </HydrationBoundary>
  );
}
