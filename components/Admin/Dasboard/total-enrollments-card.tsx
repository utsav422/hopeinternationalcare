import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTotalEnrollment } from '@/hooks/admin/dashboard';

function TotalEnrollmentsCard() {
  const { data: totalEnrollments } = useGetTotalEnrollment();

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
          Total Enrollments
        </CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl dark:text-white">
          +{totalEnrollments}
        </div>
        <p className="text-muted-foreground text-xs dark:text-gray-400">
          All time enrollments
        </p>
      </CardContent>
    </Card>
  );
}

export default TotalEnrollmentsCard;
