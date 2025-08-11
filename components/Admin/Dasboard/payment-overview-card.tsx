import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useGetPaymentByStatus } from '@/hooks/admin/dashboard';
import type { TypePaymentStatus } from '@/utils/db/schema';

function PaymentOverviewCard() {
  const { data: paymentsByStatus } = useGetPaymentByStatus();
  //   if (error) {
  //     toast.error(error.message);
  // }
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
  //   if (isLoading) {
  //     return <DashboardCardSkeleton />;
  //   }
  return (
    <Card className="col-span-3 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Payment Status</CardTitle>
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
                  <ChartTooltipContent className="dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
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
