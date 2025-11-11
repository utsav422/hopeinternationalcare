import type { Metadata } from 'next';
import { ContactUs } from './contactus';
import { ContactUsCard } from './contactus-card';
import { ContactUsForm } from './contactus-form';
import {
    generateMetadata as generateSEOMetadata,
    seoConfigs,
} from '@/lib/seo/metadata';
import { ContactPageStructuredData } from '@/components/SEO/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
    ...seoConfigs.contact,
    canonical: 'https://hopeinternational.com.np/contactus',
});

export default function Contact() {
    return (
        <>
            <ContactPageStructuredData />
            <ContactUs />
            <ContactUsCard />
            <ContactUsForm />
        </>
    );
}
