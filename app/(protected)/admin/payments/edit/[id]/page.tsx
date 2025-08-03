import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import PaymentForm from '@/components/Admin/Payments/payment-form';
import { queryKeys } from '@/hooks/query-keys';
import { adminGetPaymentOnlyDetailsById } from '@/server-actions/admin/payments';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default async function EditPaymentPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const params = await props.params;
  const { id } = params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => adminGetPaymentOnlyDetailsById(id),
  });

  //   const { data: payment } = await adminGetPaymentOnlyDetailsById(id);
  //   if (!payment) {
  //     notFound();
  //   }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback="Loading ...">
        <PaymentForm formTitle="Edit Payment Form" id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
