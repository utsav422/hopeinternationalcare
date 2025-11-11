import { NextResponse } from 'next/server';
import { getCachedPublicCourses } from '@/lib/server-actions/public/courses-optimized';

// Next.js 15 Dynamic Courses Sitemap
export async function GET() {
    const baseUrl = 'https://hopeinternational.com.np';

    try {
        // Get all courses
        const coursesResponse = await getCachedPublicCourses({
            pageSize: 1000,
        });
        const courses = coursesResponse.data?.data || [];

        // Generate XML sitemap for courses
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${courses
      .map(course => {
          const lastModified = new Date(
              course.updated_at || course.created_at
          ).toISOString();
          const imageUrl = course.image_url
              ? `${baseUrl}${course.image_url}`
              : `${baseUrl}/opengraph-image.png`;

          return `
  <url>
    <loc>${baseUrl}/courses/${course.slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${course.title}</image:title>
      <image:caption>${course.course_overview || course.title}</image:caption>
    </image:image>
    <mobile:mobile/>
  </url>`;
      })
      .join('')}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('Error generating courses sitemap:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
