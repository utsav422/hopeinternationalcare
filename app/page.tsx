import type { Metadata } from 'next';
import CarouselFeatures from './carousel-features';
import Hero from './hero';
import OurCoursesOverview from './our-courses-overview';
import OurServices from './our-services';
import WhyChooseUs from './why-choose-us';
import BackgroungImageCarousel from './backgroung-image-carousel';
import {
    generateMetadata as generateSEOMetadata,
    seoConfigs,
} from '@/lib/seo/metadata';
import {
    ReviewStructuredData,
    LocalBusinessStructuredData,
    ServiceStructuredData,
} from '@/components/SEO/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
    ...seoConfigs.home,
    canonical: 'https://hopeinternational.com.np',
});

// Testimonials data for structured data
const testimonials = [
    {
        author: 'Rija Khadki',
        reviewBody: 'Outstanding course contents and experienced tutor.',
        ratingValue: 5,
        datePublished: '2024-01-15',
        title: 'Care Giver Student',
        image: '/image/subina.jpeg',
    },
    {
        author: 'Subina Shrestha',
        reviewBody:
            'Fantastic course with great course content. I have learned so much in such a short period.',
        ratingValue: 5,
        datePublished: '2024-01-20',
        title: 'Care Giver Student',
        image: '/image/rija.jpeg',
    },
    {
        author: 'Arju Dhungana',
        reviewBody:
            'I am very much satisfied with their course and teaching method.',
        ratingValue: 5,
        datePublished: '2024-02-01',
        title: 'Care Giver Student',
        image: '/image/arju.jpeg',
    },
    {
        author: 'Sarita Giri',
        reviewBody: 'Good training center.',
        ratingValue: 4,
        datePublished: '2024-02-10',
        title: 'Care Giver Student',
        image: '/image/sarita.jpeg',
    },
];

// Services data for structured data
const services = [
    {
        name: 'Comprehensive Caregiver Training Packages',
        description:
            'Are you passionate about providing compassionate care to the elderly? Our comprehensive caregiver training packages are designed to equip you with the essential skills and knowledge needed to excel in the field of elderly care.',
        provider: 'Hope International',
        serviceType: 'Educational Service',
        areaServed: 'Kathmandu, Nepal',
    },
    {
        name: 'Personalized Career Guidance and Support',
        description:
            'Ready to take the next step in your career in elderly care? Our personalized career guidance and support services are here to help you navigate your professional journey with confidence.',
        provider: 'Hope International',
        serviceType: 'Career Counseling',
        areaServed: 'Kathmandu, Nepal',
    },
];

export default function Home() {
    return (
        <>
            <ReviewStructuredData reviews={testimonials} />
            <LocalBusinessStructuredData />
            <ServiceStructuredData services={services} />
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
        </>
    );
}
