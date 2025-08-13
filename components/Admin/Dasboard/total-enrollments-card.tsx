import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTotalEnrollments } from '@/hooks/admin/dashboard';
import { DashboardCardSkeleton } from '.';

function TotalEnrollmentsCard() {
    const { data: queryResult, error, isLoading } = useGetTotalEnrollments();
    const totalEnrollments = queryResult.data;

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
                    Total Enrollments
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground " />
            </CardHeader>
            <CardContent>
                <div className="font-bold text-2xl ">
                    +{totalEnrollments}
                </div>
                <p className="text-muted-foreground text-xs ">
                    All time enrollments
                </p>
            </CardContent>
        </Card>
    );
}

export default TotalEnrollmentsCard;
