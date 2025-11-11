'use client';
import { Suspense } from 'react';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
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
        <Card className="w-full ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5">
                <Skeleton className="h-4 w-[250px] text-muted-foreground " />
                <Skeleton className="h-4 w-4 text-muted-foreground " />
            </CardHeader>
            <CardContent>
                <Skeleton className="mb-2 h-6 w-[150px] font-bold text-2xl " />
                <Skeleton className="h-4 w-[325px] text-muted-foreground text-xs " />
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    return (
        <QueryErrorWrapper>
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <QueryErrorWrapper>
                        <Suspense fallback={<DashboardCardSkeleton />}>
                            <TotalIncomeCard />
                        </Suspense>
                    </QueryErrorWrapper>
                    <QueryErrorWrapper>
                        <Suspense fallback={<DashboardCardSkeleton />}>
                            <TotalUserCard />
                        </Suspense>
                    </QueryErrorWrapper>
                    <QueryErrorWrapper>
                        <Suspense fallback={<DashboardCardSkeleton />}>
                            <TotalEnrollmentsCard />
                        </Suspense>
                    </QueryErrorWrapper>
                    <QueryErrorWrapper>
                        <Suspense fallback={<DashboardCardSkeleton />}>
                            <TotalCompletedEnrollmentsCard />
                        </Suspense>
                    </QueryErrorWrapper>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <QueryErrorWrapper>
                        <Suspense fallback={<DashboardCardSkeleton />}>
                            <EnrollmentOverviewCard />
                        </Suspense>
                    </QueryErrorWrapper>
                    <QueryErrorWrapper>
                        <Suspense fallback={<DashboardCardSkeleton />}>
                            <PaymentOverviewCard />
                        </Suspense>
                    </QueryErrorWrapper>
                </div>
            </div>
        </QueryErrorWrapper>
    );
}
