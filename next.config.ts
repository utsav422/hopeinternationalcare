import nextMdx from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = nextMdx({
    extension: /\.mdx?$/,
});
const nextConfig: NextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    pageExtensions: ['ts', 'tsx', 'mdx'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'hopeinternationalcare.org',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'ekyvcdmqqcpguabhqxrw.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'supabase.hopeinternationalcare.org',
            },
        ],
    },
};

export default withMDX(nextConfig);
