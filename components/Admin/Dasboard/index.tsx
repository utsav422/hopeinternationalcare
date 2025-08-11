'use client';
import { Suspense } from 'react';
import { QueryErrorWrapper } from '@/components/Custom/QueryErrorWrapper';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EnrollmentOverviewCard from './enrollments-overview-card';
import PaymentOverviewCard from './payment-overview-card';
import TotalCompletedEnrollmentsCard from './total-completed-enrollments-card';
import TotalEnrollmentsCard from './total-enrollments-card';
import TotalIncomeCard from './total-income-card';
import TotalUserCard from './total-users-card';

export function DashboardCardSkeleton() {
  return (
    <Card className="w-full dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5">
        <Skeleton className="h-4 w-[250px] text-muted-foreground dark:text-gray-400" />
        <Skeleton className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-6 w-[150px] font-bold text-2xl dark:text-white" />
        <Skeleton className="h-4 w-[325px] text-muted-foreground text-xs dark:text-gray-400" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <QueryErrorWrapper>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<DashboardCardSkeleton />}>
            <TotalIncomeCard />
          </Suspense>
          <Suspense fallback={<DashboardCardSkeleton />}>
            <TotalUserCard />
          </Suspense>
          <Suspense fallback={<DashboardCardSkeleton />}>
            <TotalEnrollmentsCard />
          </Suspense>
          <Suspense fallback={<DashboardCardSkeleton />}>
            <TotalCompletedEnrollmentsCard />
          </Suspense>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Suspense fallback={<DashboardCardSkeleton />}>
            <EnrollmentOverviewCard />
          </Suspense>
          <Suspense fallback={<DashboardCardSkeleton />}>
            <PaymentOverviewCard />
          </Suspense>
        </div>
      </div>
    </QueryErrorWrapper>
  );
}
