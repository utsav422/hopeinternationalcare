import { Roboto } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/utils/provider/query-provider';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Hope International Care',
  description: 'Hope International Aged Care Training And Elderly Care Center',
};

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={roboto.className} lang="en" suppressHydrationWarning>
      <head>
        <script
          data-site="YOUR_DOMAIN_HERE"
          defer
          src="https://api.nepcha.com/js/nepcha-analytics.js"
        />
        <link href="/favicon.png" rel="shortcut icon" type="image/png" />
      </head>
      <body>
        <QueryProvider>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              //   disableTransitionOnChange
            >
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
