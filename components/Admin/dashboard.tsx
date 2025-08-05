'use client';

import {  useQueryClient } from '@tanstack/react-query';
import { BookOpen, CheckCircle, DollarSign, Users } from 'lucide-react';
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
import { useDashboardSummary } from '@/hooks/dashboard';
import { useRealtime } from '@/hooks/use-realtime';
import type {
  TypeEnrollmentStatus,
  TypePaymentStatus,
} from '@/utils/db/schema/enums';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const {
    data: summary,
    isLoading: loading,
    error,
  } = useDashboardSummary();

  useRealtime('enrollments', () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  });

  useRealtime('payments', () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  });

  useRealtime('profiles', () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  });

  if (loading) {
    return <div className="p-4">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error?.message}</div>;
  }

  if (!summary) {
    return <div className="p-4">No dashboard data available.</div>;
  }

  const enrollmentChartData = summary.enrollmentsByStatus.map(
    (item: { status: TypeEnrollmentStatus; count: number }) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      count: item.count,
    })
  );

  const paymentChartData = summary.paymentsByStatus.map(
    (item: {
      status: TypePaymentStatus;
      count: number;
      totalAmount: number;
    }) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      count: item.count,
      totalAmount: item.totalAmount,
    })
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm dark:text-white">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl dark:text-white">
              ${Number(summary.totalIncome).toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs dark:text-gray-400">
              Based on completed payments
            </p>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm dark:text-white">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl dark:text-white">+{summary.totalUsers}</div>
            <p className="text-muted-foreground text-xs dark:text-gray-400">Registered users</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm dark:text-white">
              Total Enrollments
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl dark:text-white">
              +{summary.totalEnrollments}
            </div>
            <p className="text-muted-foreground text-xs dark:text-gray-400">
              All time enrollments
            </p>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm dark:text-white">
              Completed Enrollments
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl dark:text-white">
              {summary.enrollmentsByStatus.find(
                (e: { status: TypeEnrollmentStatus; count: number }) =>
                  e.status === 'completed'
              )?.count || 0}
            </div>
            <p className="text-muted-foreground text-xs dark:text-gray-400">
              Enrollments with 'completed' status
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Enrollments Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              className="aspect-auto h-[250px] w-full"
              config={{}}
            >
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={enrollmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)"/>
                  <XAxis dataKey="name" tick={{ fill: 'white' }} />
                  <YAxis tick={{ fill: 'white' }} />
                  <ChartTooltip content={<ChartTooltipContent className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />} />
                  <Legend wrapperStyle={{ color: 'white' }}/>
                  <Bar dataKey="count" fill="#8884d8" name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              className="aspect-auto h-[250px] w-full"
              config={{}}
            >
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={paymentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)"/>
                  <XAxis dataKey="name" tick={{ fill: 'white' }}/>
                  <YAxis tick={{ fill: 'white' }}/>
                  <ChartTooltip content={<ChartTooltipContent className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />} />
                  <Legend wrapperStyle={{ color: 'white' }}/>
                  <Bar dataKey="count" fill="#82ca9d" name="Payments Count" />
                  <Bar
                    dataKey="totalAmount"
                    fill="#ffc658"
                    name="Total Amount"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
