'use client';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetActiveIntakesByCourseId } from '@/hooks/public/intakes';

export function CourseIntakesSkeleton() {
    return (
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <Skeleton className="h-8 w-1/2 rounded" />
            <ul className="mt-4 space-y-4">
                <li className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                </li>
                <li className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                </li>
            </ul>
            <Skeleton className="mt-6 h-10 w-full rounded" />
        </div>
    );
}

export function CourseIntakes({ courseId }: { courseId: string }) {
    const { data: resultData, error } = useGetActiveIntakesByCourseId(courseId);
    if (error) {
        toast.error(error.message);
    }
    const intakes = resultData?.data;
    if (!intakes) {
        notFound();
    }

    if (intakes.length === 0) {
        return (
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="mb-4 font-semibold text-2xl text-gray-800 ">
                    Upcoming Intakes
                </h2>
                <p className="text-gray-600 ">
                    No upcoming intakes available at the moment. Please check back later.
                </p>
            </div>
        );
    }

    const nextIntake = intakes[0];

    return (
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-2xl text-gray-800 ">
                Upcoming Intakes
            </h2>
            <ul className="space-y-4 text-gray-600 ">
                {intakes.map(
                    (intake: {
                        start_date: string;
                        end_date: string;
                        id: string;
                        created_at: string;
                        updated_at: string;
                        course_id: string | null;
                        capacity: number;
                        is_open: boolean | null;
                        total_registered: number;
                    }) => (
                        <li className="flex items-center" key={intake?.id}>
                            <CheckCircleIcon className="mr-3 h-6 w-6 text-teal-500" />
                            <span>
                                <strong>
                                    {new Date(intake?.start_date as string).toLocaleDateString()}
                                </strong>{' '}
                                - {new Date(intake?.end_date).toLocaleDateString()}
                            </span>
                        </li>
                    )
                )}
            </ul>
            <Button
                asChild
                className="mt-6 w-full bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
                <Link href={`/student/enroll?intake_id=${nextIntake.id}`}>
                    Enroll Now
                </Link>
            </Button>
        </div>
    );
}
