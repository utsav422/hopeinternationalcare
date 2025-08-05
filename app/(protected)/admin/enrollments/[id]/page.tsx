'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import EnrollmentDetailsCard from '@/components/Admin/Enrollments/enrollment-details-card';
import { queryKeys } from '@/hooks/query-keys';
import { adminGetEnrollmentById } from '@/server-actions/admin/enrollments';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Enrollments(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();

  const params = await props.params;
  const id = params.id;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: () => adminGetEnrollmentById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback="Loading...">
        <EnrollmentDetailsCard />
      </Suspense>
    </HydrationBoundary>
  );
}
