import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useAdminDashboardEnrollmentListByStatus } from '@/hooks/admin/dashboard';
import type { TypeEnrollmentStatus } from '@/lib/db/schema';
import { DashboardCardSkeleton } from '.';

function EnrollmentOverviewCard() {
    const {
        data: queryResult,
        error,
        isLoading,
    } = useAdminDashboardEnrollmentListByStatus();
    const enrollmentsByStatus = queryResult.data;
    const success = queryResult?.success;

    const queryDataError = queryResult?.error;
    if (error || !queryResult || !success || queryDataError) {
        toast.error(
            error?.message ?? queryDataError ?? 'Unexpected error occurs'
        );
    }
    if (error) {
        toast.error(error.message);
    }
    const enrollmentChartData =
        enrollmentsByStatus?.map(
            (item: { status: TypeEnrollmentStatus; count: number }) => ({
                name:
                    item.status.charAt(0).toUpperCase() + item.status.slice(1),
                count: item.count,
            })
        ) ?? [];
    if (isLoading) {
        return <DashboardCardSkeleton />;
    }
    return (
        <Card className="col-span-4 ">
            <CardHeader>
                <CardTitle className="">Enrollments Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer
                    className="aspect-auto h-[250px] w-full"
                    config={{}}
                >
                    <ResponsiveContainer height="100%" width="100%">
                        <BarChart data={enrollmentChartData}>
                            <CartesianGrid
                                stroke="rgba(255, 255, 255, 0.2)"
                                strokeDasharray="3 3"
                            />
                            <XAxis dataKey="name" tick={{ fill: 'white' }} />
                            <YAxis tick={{ fill: 'white' }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend wrapperStyle={{ color: 'white' }} />
                            <Bar
                                dataKey="count"
                                fill="#8884d8"
                                name="Enrollments"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default EnrollmentOverviewCard;
