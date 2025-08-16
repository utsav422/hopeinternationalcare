'use client';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
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

export function CourseContent({ image_url, title, description }: { image_url: string, title: string, description: string }) {

    return (
        <>
            <div className="overflow-hidden rounded-lg shadow-lg">
                <Image unoptimized={true}
                    alt={title}
                    className="h-auto w-full object-cover"
                    height={500}
                    src={image_url as string}
                    width={800}
                />
            </div>
            <CourseDescription markdown={description || ''} />
        </>
    );
}
