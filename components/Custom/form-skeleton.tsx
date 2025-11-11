'use client';
import { Skeleton } from '@/components/ui/skeleton';
export default function FormSkeleton() {
    return (
        <div className="space-y-8">
            <div className="rounded-lg border p-4 /50">
                <Skeleton className="mb-4 h-6 w-1/4" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-10 w-20" />
        </div>
    );
}
