'use client';
import { notFound, useParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { useGetPublicCourseBySlug } from '@/lib/hooks/public/courses-optimized';
import { CourseContent, CourseContentSkeleton } from './course-content';
import { CourseIntakes, CourseIntakesSkeleton } from './course-intakes';
import { CourseSidebar, CourseSidebarSkeleton } from './course-sidebar';
import { RelatedCourses, RelatedCoursesSkeleton } from './related-courses';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

function CourseDetails() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;
    const {
        data: resultData,
        error,
        isLoading,
    } = useGetPublicCourseBySlug(slug);
    if (error) {
        toast.error(error.message);
    }
    const course = resultData.data;
    if (!course) {
        notFound();
    }
    if (isLoading) return <>Loading ...</>;
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
                        <CourseContent
                            title={course.title}
                            image_url={course?.image_url as string}
                            overview={course?.course_overview as string}
                            highlights={course?.course_highlights as string}
                            level={course.level}
                            duration_value={course.duration_value}
                            duration_type={course.duration_type}
                            category={course.category?.name}
                        />
                    </main>

                    <aside className="space-y-8">
                        <CourseSidebar
                            price={course.price}
                            duration_type={course.duration_type}
                            duration_value={course.duration_value}
                        />
                        <QueryErrorWrapper>
                            <Suspense fallback={<CourseIntakesSkeleton />}>
                                <CourseIntakes courseId={course.id} />
                            </Suspense>
                        </QueryErrorWrapper>
                        <QueryErrorWrapper>
                            <Suspense fallback={<RelatedCoursesSkeleton />}>
                                <RelatedCourses
                                    categoryId={course.category_id as string}
                                    courseId={course.id}
                                />
                            </Suspense>
                        </QueryErrorWrapper>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default CourseDetails;
