import type { MetadataRoute } from 'next';
import { getCachedPublicCourses } from '@/lib/server-actions/public/courses';
import { getCachedPublicAllCategories } from '@/lib/server-actions/public/course-categories';

// Next.js 15 Enhanced Sitemap with comprehensive SEO optimization
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://hopeinternational.com.np';
    const currentDate = new Date().toISOString();

    // Get all courses for dynamic routes
    const coursesResponse = await getCachedPublicCourses({ pageSize: 1000 });
    const courses = coursesResponse.data || [];

    // Get all categories for dynamic routes
    const categoriesResponse = await getCachedPublicAllCategories();
    const categories = categoriesResponse.data || [];

    // Static pages with high priority - Next.js 15 optimized
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/aboutus`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/courses`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contactus`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        // Additional important pages
        {
            url: `${baseUrl}/sign-in`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/sign-up`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/forgot-password`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
        {
            url: `${baseUrl}/reset-password`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
    ];

    // Course pages with medium-high priority
    const courseUrls: MetadataRoute.Sitemap = courses.map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: new Date(
            course.updated_at || course.created_at
        ).toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Category pages with SEO optimization
    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${baseUrl}/courses?category=${category.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // User dashboard pages (for authenticated users)
    const userPages: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/users/profile`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/users/enrollments`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/users/payment-history`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Combine all URLs with proper sorting by priority
    const allUrls = [
        ...staticPages,
        ...courseUrls,
        ...categoryUrls,
        ...userPages,
    ];

    // Sort by priority (highest first) for better SEO
    return allUrls.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
