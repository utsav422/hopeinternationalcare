import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { queryKeys } from '@/lib/query-keys';
import { getCachedPublicCourses } from '@/lib/server-actions/public/courses';
import { AllCourses } from './courses';

export const metadata: Metadata = {
  title: 'Our Courses | Hope International',
  description:
    'Explore the wide range of courses we offer at Hope International. We provide comprehensive training for caregivers, including specialized courses for various levels of care.',
  openGraph: {
    title: 'Our Courses | Hope International',
    description:
      'Explore the wide range of courses we offer at Hope International. We provide comprehensive training for caregivers, including specialized courses for various levels of care.',
    url: 'https://hopeinternational.com.np/courses',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function Campaign() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.publicCourses.list({ page: 1, pageSize: 10 }),
    queryFn: () => getCachedPublicCourses({ page: 1, pageSize: 10 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="pt-20">
        <AllCourses />
      </div>
    </HydrationBoundary>
  );
}
