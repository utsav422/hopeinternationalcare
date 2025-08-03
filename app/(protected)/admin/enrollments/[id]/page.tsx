'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { toast } from 'sonner';
import EnrollmentDetailsCard from '@/components/Admin/Enrollments/enrollment-details-card';
import { queryKeys } from '@/hooks/query-keys';
import { adminGetEnrollmentById } from '@/server-actions/admin/enrollments';
import { requireAdmin } from '@/utils/auth-guard';
import type { CustomEnrollmentDetailsType } from '@/utils/db/drizzle-zod-schema/enrollment';
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

  const { success, message, enrollment } = await adminGetEnrollmentById(id);

  if (!(success || enrollment)) {
    toast.error(`${success ?? `No Data found for enrollment id: ${id}`} `);
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6">
        <h1 className="mb-6 font-bold text-2xl">Enrollment Details</h1>
        {!success && <div>Enrollment not found. {message}</div>}
        <Suspense fallback="Loading...">
          <EnrollmentDetailsCard
            enrollment={enrollment as CustomEnrollmentDetailsType}
          />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
