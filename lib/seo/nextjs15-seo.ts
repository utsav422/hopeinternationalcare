// Next.js 15 Advanced SEO Configuration and Utilities

import type { Metadata, Viewport } from 'next';

// Base configuration for Hope International
export const seoConfig = {
    siteName: 'Hope International',
    siteUrl: 'https://hopeinternational.com.np',
    defaultTitle: 'Hope International - Aged Care Training and Elderly Care Center',
    defaultDescription: 'Hope International is a leading training center in Kathmandu, Nepal, providing comprehensive caregiver training and elderly care services.',
    defaultImage: '/opengraph-image.png',
    twitterHandle: '@hopeinternational',
    locale: 'en_US',
    themeColor: '#2563eb',
    backgroundColor: '#ffffff',
} as const;

// JSON-LD Schema generator for Next.js 15
export function generateJSONLD(schema: object | object[]) {
    return {
        __html: JSON.stringify(Array.isArray(schema) ? schema : [schema], null, 0),
    };
}

// SEO-optimized link preloading
export function generatePreloadLinks() {
    return [
        // Critical fonts
        { rel: 'preload', href: '/fonts/geist-sans.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/geist-mono.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },

        // DNS prefetch
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },

        // Preconnect
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    ];
}



