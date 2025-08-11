import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import PaymentDetailsCard from '@/components/Admin/Payments/payment-details-card';
import { queryKeys } from '@/lib/query-keys';
import { adminGetPaymentDetailsWithOthersById } from '@/server-actions/admin/payments';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default async function PaymentDetailsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await props.params;
  const id = params.id;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => adminGetPaymentDetailsWithOthersById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentDetailsCard />
    </HydrationBoundary>
  );
}
