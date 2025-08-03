import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { queryKeys } from '@/hooks/query-keys';
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

  const intake = await adminGetIntakeById(params.id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Card>
        <CardHeader>
          <CardTitle>Intake Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Course:</strong> {intake.course?.title}
          </p>
          <p>
            <strong>Start Date:</strong>{' '}
            {new Date(intake.start_date).toLocaleDateString()}
          </p>
          <p>
            <strong>End Date:</strong>{' '}
            {new Date(intake.end_date).toLocaleDateString()}
          </p>
          <p>
            <strong>Capacity:</strong> {intake.capacity}
          </p>
          <p>
            <strong>Is Open:</strong> {intake.is_open ? 'Yes' : 'No'}
          </p>
        </CardContent>
      </Card>
    </HydrationBoundary>
  );
}
