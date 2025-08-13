'use client';

import { useGetDashboardSummary } from '@/hooks/admin/dashboard';

export default function DashboardSummary() {
    const { data: summary, isLoading, error } = useGetDashboardSummary();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="font-medium text-gray-500 text-lg ">
                    Total Users
                </h3>
                <p className="font-bold text-3xl ">
                    {summary?.totalUsers ?? 0}
                </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="font-medium text-gray-500 text-lg ">
                    Total Enrollments
                </h3>
                <p className="font-bold text-3xl ">
                    {summary?.totalEnrollments ?? 0}
                </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="font-medium text-gray-500 text-lg ">
                    Total Income
                </h3>
                <p className="font-bold text-3xl ">
                    NPR {summary?.totalIncome ?? 0}
                </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h3 className="font-medium text-gray-500 text-lg ">
                    Completed Payments
                </h3>
                <p className="font-bold text-3xl ">
                    {summary?.paymentsByStatus.find(
                        (p: { status: string }) => p.status === 'completed'
                    )?.count ?? 0}
                </p>
            </div>
        </div>
    );
}
