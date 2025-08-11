'use client';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetRelatedCourses } from '@/hooks/public/courses';

export function RelatedCoursesSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <Skeleton className="mb-4 h-8 w-1/2 rounded" />
      <ul className="space-y-4">
        {[1, 2, 3].map((num) => (
          <li className="flex items-center space-x-4" key={num}>
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RelatedCourses({
  categoryId,
  courseId,
}: {
  categoryId: string;
  courseId: string;
}) {
  const { data: resultData, error } = useGetRelatedCourses(
    courseId,
    categoryId
  );
  if (error) {
    toast.error(error.message);
  }
  const relatedCourses = resultData?.data;
  if (!relatedCourses) {
    notFound();
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 font-semibold text-2xl text-gray-800 dark:text-gray-200">
        Related Courses
      </h2>
      <ul className="space-y-4">
        {relatedCourses.map((relatedCourse) => (
          <li key={relatedCourse.id}>
            <Link
              className="group block"
              href={`/courses/${relatedCourse.slug}`}
            >
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    alt={relatedCourse.title}
                    className="h-full w-full object-cover"
                    height={64}
                    src={relatedCourse.image_url || '/placeholder.svg'}
                    width={64}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg group-hover:text-teal-500 dark:text-gray-200 dark:group-hover:text-teal-400">
                    {relatedCourse.title}
                  </h3>
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    ${relatedCourse.price}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
