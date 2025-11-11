import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Core Next.js 15 optimizations
    reactStrictMode: true,
    compress: true,

    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },

    // Only TS/TSX pages now
    pageExtensions: ['ts', 'tsx'],

    // External packages for server components
    serverExternalPackages: ['sharp'],

    // Experimental features for performance and SEO
    experimental: {
        optimizePackageImports: ['@/components', '@/lib', '@/utils'],
        webVitalsAttribution: ['CLS', 'LCP'],
    },

    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'hopeinternationalcare.org' },
            { protocol: 'https', hostname: 'placehold.co' },
            { protocol: 'https', hostname: 'ujecylwtndmjrapyujjj.supabase.co' },
            {
                protocol: 'https',
                hostname: 'supabase.hopeinternationalcare.org',
            },
            { protocol: 'https', hostname: 'picsum.photos' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'unsplash.com' },
            { protocol: 'https', hostname: 'cdn.pixabay.com' },
            { protocol: 'https', hostname: 'images.pexels.com' },
            { protocol: 'https', hostname: '*.amazonaws.com' },
            { protocol: 'https', hostname: '*.cloudfront.net' },
            { protocol: 'https', hostname: '*.googleapis.com' },
            { protocol: 'https', hostname: '*.github.com' },
            { protocol: 'https', hostname: '*.githubusercontent.com' },
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy:
            "default-src 'self'; script-src 'none'; sandbox;",
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Headers for SEO and security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, must-revalidate',
                    },
                    { key: 'Service-Worker-Allowed', value: '/' },
                ],
            },
            {
                source: '/manifest.json',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Redirects for SEO
    async redirects() {
        return [
            { source: '/home', destination: '/', permanent: true },
            {
                source: '/course/:slug',
                destination: '/courses/:slug',
                permanent: true,
            },
            { source: '/about', destination: '/aboutus', permanent: true },
            { source: '/contact', destination: '/contactus', permanent: true },
        ];
    },
};

export default nextConfig;
