import type { MetadataRoute } from 'next';
import { getPublicCourses } from '@/server-actions/public/courses';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hopeinternational.com.np';

  // Get all courses for dynamic routes
  const coursesResponse = await getPublicCourses({ pageSize: 1000 });
  const courses = coursesResponse.data || [];

  const courseUrls = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(
      course.updated_at || course.created_at
    ).toISOString(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/aboutus`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${baseUrl}/contactus`,
      lastModified: new Date().toISOString(),
    },
    ...courseUrls,
  ];
}
