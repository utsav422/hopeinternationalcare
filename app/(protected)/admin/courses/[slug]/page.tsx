'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CourseDetailsCard from '@/components/Admin/Courses/course-details-card';
import { queryKeys } from '@/lib/query-keys';
import { getPublicCourseBySlug } from '@/server-actions/public/courses';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Courses(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();

  const params = await props.params;
  const slug = params.slug;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.courses.detail(slug),
    queryFn: () => getPublicCourseBySlug(slug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback="Loading...">
        <CourseDetailsCard />
      </Suspense>
    </HydrationBoundary>
  );
}
