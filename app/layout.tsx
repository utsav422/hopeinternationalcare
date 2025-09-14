import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {ThemeProvider} from 'next-themes';
import './globals.css';
import {NuqsAdapter} from 'nuqs/adapters/next/app';
import Layout from '@/components/Layout';
import {Toaster} from '@/components/ui/sonner';
import {QueryProvider} from '@/utils/provider/query-provider';
import {generateMetadata as generateSEOMetadata, seoConfigs} from '@/lib/seo/metadata';
import {
    EducationalOrganizationStructuredData,
    LocalBusinessStructuredData,
    WebsiteStructuredData
} from '@/components/SEO/StructuredData';

const defaultUrl = (() => {
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        // Ensure the URL starts with https://
        return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    }

    // For local development or when VERCEL_URL is not set
    return process.env.NODE_ENV === 'production'
        ? 'https://hopeinternational.com.np'  // Production fallback
        : 'http://localhost:3000';            // Development fallback
})();

export const metadata: Metadata = generateSEOMetadata({
    ...seoConfigs.home,
    canonical: defaultUrl,
});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <EducationalOrganizationStructuredData/>
            <WebsiteStructuredData/>
            <LocalBusinessStructuredData/>
            <script
                data-site="hopeinternationcare.org"
                defer
                src="https://api.nepcha.com/js/nepcha-analytics.js"
            />
            <link href="/favicon.ico" rel="shortcut icon" type="image/ico"/>
            <title>Hope International Age Care</title>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
            <NuqsAdapter>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <Layout>
                        {children}
                        <Toaster/>
                    </Layout>
                </ThemeProvider>
            </NuqsAdapter>
        </QueryProvider>
        <link
            crossOrigin="anonymous"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
            integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
            referrerPolicy="no-referrer"
            rel="stylesheet"
        />
        </body>
        </html>
    );
}
