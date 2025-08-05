import { Skeleton } from '@/components/ui/skeleton';

export function CourseCardSkeleton() {
  return (
    <div className="transform rounded-lg bg-white p-5 shadow-lg dark:bg-gray-900 dark:shadow-2xl">
      <div className="mb-4 h-48 w-full overflow-hidden rounded-md">
        <Skeleton className="h-full w-full dark:bg-gray-700" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4 dark:bg-gray-700" />
        <Skeleton className="h-4 w-full dark:bg-gray-700" />
        <Skeleton className="h-4 w-5/6 dark:bg-gray-700" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-1/4 dark:bg-gray-700" />
          <Skeleton className="h-5 w-1/3 dark:bg-gray-700" />
        </div>
        <Skeleton className="h-4 w-1/2 dark:bg-gray-700" />
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-10 flex-1 rounded-md dark:bg-gray-700" />
          <Skeleton className="h-10 flex-1 rounded-md dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
