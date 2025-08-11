import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEnrollementByStatus } from '@/hooks/admin/dashboard';
import type { TypeEnrollmentStatus } from '@/utils/db/schema';

function TotalCompletedEnrollmentsCard() {

  const { data: enrollmentsByStatus } = useGetEnrollementByStatus();
 
  //   if (error) {
  //     toast.error(error.message);
  //   }
  //   if (isLoading) {
  //     return <DashboardCardSkeleton />;
  //   }
  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm dark:text-white">
          Completed Enrollments
        </CardTitle>
        <CheckCircle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl dark:text-white">
          {enrollmentsByStatus?.find(
            (e: { status: TypeEnrollmentStatus; count: number }) =>
              e.status === 'completed'
          )?.count || 0}
        </div>
        <p className="text-muted-foreground text-xs dark:text-gray-400">
          Enrollments with 'completed' status
        </p>
      </CardContent>
    </Card>
  );
}

export default TotalCompletedEnrollmentsCard;
