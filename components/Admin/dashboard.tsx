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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${Number(summary.totalIncome).toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">
              Based on completed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">+{summary.totalUsers}</div>
            <p className="text-muted-foreground text-xs">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Enrollments
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              +{summary.totalEnrollments}
            </div>
            <p className="text-muted-foreground text-xs">
              All time enrollments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Completed Enrollments
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {summary.enrollmentsByStatus.find(
                (e: { status: TypeEnrollmentStatus; count: number }) =>
                  e.status === 'completed'
              )?.count || 0}
            </div>
            <p className="text-muted-foreground text-xs">
              Enrollments with 'completed' status
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Enrollments Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              className="aspect-auto h-[250px] w-full"
              config={{}}
            >
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={enrollmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              className="aspect-auto h-[250px] w-full"
              config={{}}
            >
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={paymentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
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
