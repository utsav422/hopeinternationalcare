import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEnrollmentsByStatus } from '@/hooks/admin/dashboard';
import type { TypeEnrollmentStatus } from '@/lib/db/schema';
import { DashboardCardSkeleton } from '.';

function TotalCompletedEnrollmentsCard() {
    const { data: queryResult, isLoading, error } = useGetEnrollmentsByStatus();
    const success = queryResult?.success;
    const queryDataError = queryResult?.error;
    const enrollmentsByStatus = queryResult?.data;
    if (error || !queryResult || !success || queryDataError) {
        toast.error(error?.message ?? queryDataError ?? 'Unexpected error occurs');
    }
    if (error) {
        toast.error(error.message);
    }
    if (isLoading) {
        return <DashboardCardSkeleton />;
    }
    return (
        <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm ">
                    Completed Enrollments
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground " />
            </CardHeader>
            <CardContent>
                <div className="font-bold text-2xl ">
                    {enrollmentsByStatus?.find(
                        (e: { status: TypeEnrollmentStatus; count: number }) =>
                            e.status === 'completed'
                    )?.count || 0}
                </div>
                <p className="text-muted-foreground text-xs ">
                    Enrollments with 'completed' status
                </p>
            </CardContent>
        </Card>
    );
}

export default TotalCompletedEnrollmentsCard;
