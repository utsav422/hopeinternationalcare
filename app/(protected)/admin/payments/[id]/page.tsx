import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import PaymentDetailsCard from '@/components/Admin/Payments/payment-details-card';
import { queryKeys } from '@/hooks/query-keys';
import { adminGetPaymentDetailsWithOthersById } from '@/server-actions/admin/payments';
import { requireAdmin } from '@/utils/auth-guard';
import type { PaymentDetailsType } from '@/utils/db/drizzle-zod-schema/payments';
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

  const {
    data,
    success,
    message,
  }: {
    data?: PaymentDetailsType | null;
    success: boolean;
    message: string;
  } = await adminGetPaymentDetailsWithOthersById(id);

  if (!success) {
    return <p>Fetch payment faild. {message}</p>;
  }

  if (!data) {
    return <p>Payment details not found!. {message}</p>;
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentDetailsCard payment={data} />
    </HydrationBoundary>
  );
}
