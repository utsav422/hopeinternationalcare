import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/utils/provider/query-provider';

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

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: 'Hope International - Aged Care Training and Elderly Care Center',
    description:
        'Hope International is a leading training center in Kathmandu, Nepal, providing comprehensive caregiver training and elderly care services. We empower individuals with the skills to provide exceptional care to the elderly.',
};

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
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Hope International',
        url: 'https://hopeinternational.com.np',
        logo: 'https://hopeinternational.com.np/favicon.png',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+977-980-10813999',
            contactType: 'Customer Service',
        },
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Durga Bhawan, Rudramati Marga, Anamnagar',
            addressLocality: 'Kathmandu',
            postalCode: '44600',
            addressCountry: 'NP',
        },
        sameAs: [
            'https://www.facebook.com/p/Hope-International-1000637365252 Hope-International-100063736525249/',
        ],
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    type="application/ld+json"
                />
                <script
                    data-site="hopeinternationcare.org"
                    defer
                    src="https://api.nepcha.com/js/nepcha-analytics.js"
                />
                <link href="/favicon.png" rel="shortcut icon" type="image/png" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <QueryProvider>
                    <NuqsAdapter>
                        <ThemeProvider attribute="class" defaultTheme="light">
                            <Layout>
                                {children}
                                <Toaster />
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
