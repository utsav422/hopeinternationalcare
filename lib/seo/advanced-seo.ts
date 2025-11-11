// Advanced SEO utilities for comprehensive optimization

// Generate critical resource hints (used by components)
export function generateCriticalResourceHints() {
    return [
        // Critical font preloading
        {
            rel: 'preload',
            href: '/fonts/geist-sans.woff2',
            as: 'font',
            type: 'font/woff2',
            crossOrigin: 'anonymous' as const,
        },
        {
            rel: 'preload',
            href: '/fonts/geist-mono.woff2',
            as: 'font',
            type: 'font/woff2',
            crossOrigin: 'anonymous' as const,
        },

        // DNS prefetching for external resources
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
        { rel: 'dns-prefetch', href: '//api.nepcha.com' },

        // Preconnect to critical origins
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossOrigin: 'anonymous' as const,
        },
    ];
}
