'use client';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPublicCourseBySlug } from '@/hooks/admin/public-courses';
import { CourseDescription } from './course-description';

export function CourseContentSkeleton() {
    return (
        <div className="animate-pulse">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="mt-8 space-y-4">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
            </div>
        </div>
    );
}

export function CourseContent() {
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
        <>
            <div className="overflow-hidden rounded-lg shadow-lg">
                <Image
                    alt={course.title}
                    className="h-auto w-full object-cover"
                    height={500}
                    src={course.image_url as string}
                    width={800}
                />
            </div>
            <CourseDescription markdown={course.description || ''} />
        </>
    );
}
