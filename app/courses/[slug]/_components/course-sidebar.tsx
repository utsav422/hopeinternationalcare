import { CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { notFound, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPublicCourseBySlug } from '@/hooks/admin/public-courses';

export function CourseSidebarSkeleton() {
    return (
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <Skeleton className="h-8 w-3/4 rounded" />
            <ul className="mt-4 space-y-4">
                <li className="flex items-center">
                    <Skeleton className="mr-3 h-6 w-6 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                </li>
                <li className="flex items-center">
                    <Skeleton className="mr-3 h-6 w-6 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                </li>
            </ul>
        </div>
    );
}

export function CourseSidebar() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;
    const { data: resultData, error } = useGetPublicCourseBySlug(slug);
    if (error) {
        toast.error(error.message);
    }
    const course = resultData;
    if (!course) {
        notFound();
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-2xl text-gray-800 ">
                Course Details
            </h2>
            <ul className="space-y-4 text-gray-600 ">
                <li className="flex items-center">
                    <CurrencyDollarIcon className="mr-3 h-6 w-6 text-teal-500" />
                    <span>
                        <strong>Price:</strong> ${course.price}
                    </span>
                </li>
                <li className="flex items-center">
                    <UserGroupIcon className="mr-3 h-6 w-6 text-teal-500" />
                    <span>
                        <strong>Duration:</strong> {course.duration_value}{' '}
                        {course.duration_type}
                    </span>
                </li>
            </ul>
        </div>
    );
}
