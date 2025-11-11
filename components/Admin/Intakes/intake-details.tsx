'use client';

import { notFound, useParams } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminIntakeDetails } from '@/hooks/admin/intakes-optimized';

function IntakeDetailsSkeleton() {
    return (
        <Card className="">
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-1/6" />
                    <Skeleton className="h-6 w-4/6" />
                </div>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-1/6" />
                    <Skeleton className="h-6 w-4/6" />
                </div>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-1/6" />
                    <Skeleton className="h-6 w-4/6" />
                </div>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-1/6" />
                    <Skeleton className="h-6 w-4/6" />
                </div>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-1/6" />
                    <Skeleton className="h-6 w-4/6" />
                </div>
            </CardContent>
        </Card>
    );
}

function IntakeDetails() {
    const { id } = useParams<{ id: string }>();
    const {
        data: queryResult,
        error: queryError,
        isLoading,
    } = useAdminIntakeDetails(id);

    const intake = queryResult?.data?.intake;
    if (isLoading) {
        return <IntakeDetailsSkeleton />;
    }

    if (queryError || !intake || !queryResult.success) {
        toast.error(queryError?.message ?? queryResult?.error ?? 'failed to ');
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-red-500">Failed to load intake details.</p>
                {queryError?.message && (
                    <p className="text-red-500">{queryError?.message}</p>
                )}
                {queryResult?.details && (
                    <p className="text-red-500">
                        {queryResult?.details.toString()}
                    </p>
                )}
            </div>
        );
    }

    if (!intake) {
        notFound();
    }
    const course = queryResult?.data?.course;
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Card className="">
                <CardHeader>
                    <CardTitle className="font-bold text-2xl ">
                        Intake Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                            Course:
                        </p>
                        <p className="text-gray-800 ">{course?.title}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                            Start Date:
                        </p>
                        <p className="text-gray-800 ">
                            {new Date(intake.start_date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                            End Date:
                        </p>
                        <p className="text-gray-800 ">
                            {new Date(intake.end_date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                            Capacity:
                        </p>
                        <p className="text-gray-800 ">{intake.capacity}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                            Is Open:
                        </p>
                        <p className="text-gray-800 ">
                            {intake.is_open ? 'Yes' : 'No'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default IntakeDetails;
