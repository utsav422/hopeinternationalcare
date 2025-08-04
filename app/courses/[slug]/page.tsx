import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { getPublicCourseBySlug } from '@/server-actions/public/courses';
import { getCourseIntakes } from '@/server-actions/public/intakes';
import { getQueryClient } from '@/utils/get-query-client';
import CourseDetailClient from './_components/course-detail-client';

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const queryClient = getQueryClient();
  const { slug } = await params;

  // Prefetch course details
  const courseData = await queryClient.fetchQuery({
    queryKey: queryKeys.publicCourses.detail(slug),
    queryFn: () => getPublicCourseBySlug(slug),
  });

  const courseId = courseData?.data?.id;

  // Prefetch course intakes if courseId is available
  if (courseId) {
    await queryClient.fetchQuery({
      queryKey: queryKeys.intakes.detail(courseId),
      queryFn: () => getCourseIntakes(courseId),
    });
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <CourseDetailClient slug={slug} />
    </HydrationBoundary>
  );
}
