import type { Metadata } from 'next';
import { AboutUs } from './aboutus';
import { AboutUsDetails } from './aboutus-details';
import OurGoals from './our-goals';
import OurTeams from './our-team';
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo/metadata';
import { AboutPageStructuredData } from '@/components/SEO/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
    ...seoConfigs.about,
    canonical: 'https://hopeinternational.com.np/aboutus',
});

export default function Campaign() {
    return (
        <>
            <AboutPageStructuredData />
            <AboutUs />
            <AboutUsDetails />
            <OurGoals />
            <OurTeams />
        </>
    );
}
