
import type { Metadata } from 'next';
import CarouselFeatures from './carousel-features';
import Hero from './hero';
import OurCoursesOverview from './our-courses-overview';
import OurServices from './our-services';
import WhyChooseUs from './why-choose-us';
import BackgroungImageCarousel from './backgroung-image-carousel';

export const metadata: Metadata = {
    title: 'Hope International - Aged Care Training and Elderly Care Center',
    description:
        'Hope International is a leading training center in Kathmandu, Nepal, providing comprehensive caregiver training and elderly care services. We empower individuals with the skills to provide exceptional care to the elderly.',
    openGraph: {
        title: 'Hope International - Aged Care Training and Elderly Care Center',
        description:
            'Hope International is a leading training center in Kathmandu, Nepal, providing comprehensive caregiver training and elderly care services. We empower individuals with the skills to provide exceptional care to the elderly.',
        url: 'https://hopeinternational.com.np',
        siteName: 'Hope International',
        images: [
            {
                url: '/opengraph-image.png',
                width: 1200,
                height: 630,
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default function Home() {
    return (
        <main className="flex flex-col">
            <div className="relative h-screen">
                <BackgroungImageCarousel />
                <Hero />
            </div>
            <div className="bg-white dark:bg-gray-900">
                <OurServices />
                <OurCoursesOverview />
                <WhyChooseUs />
                <CarouselFeatures />
            </div>
        </main>
    );
}
