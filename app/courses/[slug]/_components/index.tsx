'use client';
import { notFound, useParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { useGetPublicCourseBySlug } from '@/hooks/admin/public-courses';
import { CourseContent, CourseContentSkeleton } from './course-content';
import { CourseIntakes, CourseIntakesSkeleton } from './course-intakes';
import { CourseSidebar, CourseSidebarSkeleton } from './course-sidebar';
import { RelatedCourses, RelatedCoursesSkeleton } from './related-courses';

function CourseDetails() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: resultData, error } = useGetPublicCourseBySlug(slug);
  if (error) {
    toast.error(error.message);
  }
  const course = resultData?.data;
  if (!course) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-gray-50 pt-20 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-extrabold text-4xl text-gray-900 tracking-tight sm:text-5xl dark:text-white">
            {course?.title}
          </h1>
          <p className="mt-2 text-gray-500 text-xl dark:text-gray-400">
            {course?.category?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <main className="lg:col-span-2">
            <Suspense fallback={<CourseContentSkeleton />}>
              <CourseContent />
            </Suspense>
          </main>

          <aside className="space-y-8">
            <Suspense fallback={<CourseSidebarSkeleton />}>
              <CourseSidebar />
            </Suspense>
            <Suspense fallback={<CourseIntakesSkeleton />}>
              <CourseIntakes courseId={course.id} />
            </Suspense>
            <Suspense fallback={<RelatedCoursesSkeleton />}>
              <RelatedCourses
                categoryId={course.category_id as string}
                courseId={course.id}
              />
            </Suspense>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
