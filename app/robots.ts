import type { MetadataRoute } from 'next';

// Next.js 15 Enhanced Robots.txt with comprehensive SEO optimization
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // General crawlers
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/users/',
                    '/api/',
                    '/_next/',
                    '/admin-auth/',
                    '/forgot-password/',
                    '/reset-password/',
                    '/setup-password/',
                    '/sign-in',
                    '/sign-up',
                    '/private/',
                    '/temp/',
                    '/cache/',
                    '/*.json$',
                    '/*.xml$',
                    '/search?*',
                    '/filter?*',
                ],
                crawlDelay: 1,
            },
            // Google-specific rules
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/courses/',
                    '/aboutus',
                    '/contactus',
                    '/sitemap.xml',
                    '/robots.txt',
                ],
                disallow: [
                    '/admin/',
                    '/users/',
                    '/api/',
                    '/admin-auth/',
                    '/private/',
                ],
                crawlDelay: 0.5,
            },
            // Bing-specific rules
            {
                userAgent: 'Bingbot',
                allow: [
                    '/',
                    '/courses/',
                    '/aboutus',
                    '/contactus',
                ],
                disallow: [
                    '/admin/',
                    '/users/',
                    '/api/',
                    '/admin-auth/',
                    '/private/',
                ],
                crawlDelay: 1,
            },
            // Social media crawlers
            {
                userAgent: 'facebookexternalhit',
                allow: [
                    '/',
                    '/courses/',
                    '/aboutus',
                    '/contactus',
                ],
                disallow: [
                    '/admin/',
                    '/users/',
                    '/api/',
                ],
            },
            {
                userAgent: 'Twitterbot',
                allow: [
                    '/',
                    '/courses/',
                    '/aboutus',
                    '/contactus',
                ],
                disallow: [
                    '/admin/',
                    '/users/',
                    '/api/',
                ],
            },
            // LinkedIn crawler
            {
                userAgent: 'LinkedInBot',
                allow: [
                    '/',
                    '/courses/',
                    '/aboutus',
                    '/contactus',
                ],
                disallow: [
                    '/admin/',
                    '/users/',
                    '/api/',
                ],
            },
            // Block malicious bots
            {
                userAgent: [
                    'AhrefsBot',
                    'SemrushBot',
                    'MJ12bot',
                    'DotBot',
                    'AspiegelBot',
                    'SurveyBot',
                    'MegaIndex.ru',
                    'BLEXBot',
                    'YandexBot',
                ],
                disallow: '/',
            },
        ],
        sitemap: [
            'https://hopeinternational.com.np/sitemap.xml',
            'https://hopeinternational.com.np/sitemap-courses.xml',
            'https://hopeinternational.com.np/sitemap-categories.xml',
        ],
        host: 'https://hopeinternational.com.np',
    };
}
