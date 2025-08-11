import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/users/'],
    },
    sitemap: 'https://hopeinternational.com.np/sitemap.xml',
  };
}
