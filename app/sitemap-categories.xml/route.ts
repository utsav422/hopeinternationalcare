import { NextResponse } from 'next/server';
import { getCachedPublicAllCategories } from '@/lib/server-actions/public/courses-categories';

// Next.js 15 Dynamic Categories Sitemap
export async function GET() {
    const baseUrl = 'https://hopeinternational.com.np';

    try {
        // Get all categories
        const categoriesResponse = await getCachedPublicAllCategories();
        const categories = categoriesResponse.data || [];

        // Generate XML sitemap for categories
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
  ${categories
                .map((category) => {
                    const lastModified = new Date().toISOString();

                    return `
  <url>
    <loc>${baseUrl}/courses?category=${category.id}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
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
        console.error('Error generating categories sitemap:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
