'use client';
import { notFound, useParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { useGetPublicCourseBySlug } from '@/hooks/admin/public-courses';
import { CourseContent, CourseContentSkeleton } from './course-content';
import { CourseIntakes, CourseIntakesSkeleton } from './course-intakes';
import { CourseSidebar, CourseSidebarSkeleton } from './course-sidebar';
import { RelatedCourses, RelatedCoursesSkeleton } from './related-courses';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

function CourseDetails() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;
    const { data: resultData, error, isLoading } = useGetPublicCourseBySlug(slug);
    if (error) {
        toast.error(error.message);
    }
    const course = resultData;
    if (!course) {
        notFound();
    }
    if (isLoading) return <>Loading ...</>
    return (
        <div className="min-h-screen bg-gray-50 pt-20 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="font-extrabold text-4xl text-gray-900 tracking-tight sm:text-5xl ">
                        {course?.title}
                    </h1>
                    <p className="mt-2 text-gray-500 text-xl ">
                        {course?.category?.name}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    <main className="lg:col-span-2">
                        <QueryErrorWrapper>
                            <Suspense fallback={<CourseContentSkeleton />}>
                                <CourseContent />
                            </Suspense>
                        </QueryErrorWrapper>
                    </main>

                    <aside className="space-y-8">
                        <QueryErrorWrapper>
                            <Suspense fallback={<CourseSidebarSkeleton />}>
                                <CourseSidebar />
                            </Suspense>
                        </QueryErrorWrapper>
                        {course.id && <>
                            <QueryErrorWrapper>
                                <Suspense fallback={<CourseIntakesSkeleton />}>
                                    <CourseIntakes courseId={course.id} />
                                </Suspense>
                            </QueryErrorWrapper>
                            <Suspense fallback={<RelatedCoursesSkeleton />}>
                                <RelatedCourses
                                    categoryId={course.category_id as string}
                                    courseId={course.id}
                                />
                            </Suspense>
                        </>}
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default CourseDetails;
