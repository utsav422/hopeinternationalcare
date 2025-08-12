import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { queryKeys } from '@/lib/query-keys';
import { getCachedPublicCourseBySlug } from '@/lib/server-actions/public/courses';
import CourseDetails from './_components';

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: CourseDetailPageProps
): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const courseData = await getCachedPublicCourseBySlug(slug);

  if (!courseData?.data) {
    return {};
  }
  const course = courseData.data;
  return {
    title: `${course.title} | Hope International`,
    description: course.description,
    openGraph: {
      title: `${course.title} | Hope International`,
      description: course.description || '',
      url: `https://hopeinternational.com.np/courses/${course.slug}`,
      images: [
        {
          url: course.image_url || '/opengraph-image.png',
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.publicCourses.detail(slug),
    queryFn: () => getCachedPublicCourseBySlug(slug),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CourseDetails />
    </HydrationBoundary>
  );
}
