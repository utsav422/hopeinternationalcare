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
import { useAdminDashboardPaymentListByStatus } from '@/hooks/admin/dashboard';
import type { TypePaymentStatus } from '@/lib/db/schema';
import { DashboardCardSkeleton } from '.';

function PaymentOverviewCard() {
    const { data: queryResult, error, isLoading } = useAdminDashboardPaymentListByStatus();
    const success = queryResult?.success;
    const queryDataError = queryResult?.error;
    const paymentsByStatus = queryResult?.data;
    if (error || !queryResult || !success || queryDataError) {
        toast.error(error?.message ?? queryDataError ?? 'Unexpected error occurs');
    }
    const paymentChartData =
        paymentsByStatus?.map(
            (item: {
                status: TypePaymentStatus;
                count: number;
                totalAmount: number;
            }) => ({
                name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                count: item.count,
                totalAmount: item.totalAmount,
            })
        ) ?? [];
    if (isLoading) {
        return <DashboardCardSkeleton />;
    }
    return (
        <Card className="col-span-3 ">
            <CardHeader>
                <CardTitle className="">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer className="aspect-auto h-[250px] w-full" config={{}}>
                    <ResponsiveContainer height="100%" width="100%">
                        <BarChart data={paymentChartData}>
                            <CartesianGrid
                                stroke="rgba(255, 255, 255, 0.2)"
                                strokeDasharray="3 3"
                            />
                            <XAxis dataKey="name" tick={{ fill: 'white' }} />
                            <YAxis tick={{ fill: 'white' }} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent />
                                }
                            />
                            <Legend wrapperStyle={{ color: 'white' }} />
                            <Bar dataKey="count" fill="#82ca9d" name="Payments Count" />
                            <Bar dataKey="totalAmount" fill="#ffc658" name="Total Amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default PaymentOverviewCard;
