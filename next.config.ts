import nextMdx from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = nextMdx({
  extension: /\.mdx?$/,
});
const nextConfig: NextConfig = {
  eslint: {
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
    ],
  },
};

export default withMDX(nextConfig);
