'use client';

import { HomeIcon, InboxIcon, PhoneIcon } from '@heroicons/react/24/solid';
import FeatureCard from '@/components/Custom/feature-card';

export function ContactUsCard() {
    const CONTACTTYPE = [
        {
            icon: PhoneIcon,
            title: 'Phone Number',
            description: 'Tel: +977-980-10813999',
        },
        {
            icon: InboxIcon,
            title: 'Email Us',
            description: 'info@hopeinternationalcare.org',
        },
        {
            icon: HomeIcon,
            title: 'Visit Office',
            description:
                'Durga Bhawan, Rudramati Marga, Anamnagar, Kathmandu, Nepal (behind Occidental Public School)',
        },
    ];

    return (
        <section className="relative bg-gray-50 py-16 md:py-24 lg:py-32 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="font-extrabold text-3xl text-gray-900 sm:text-4xl md:text-5xl ">
                        Get in Touch
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-600 text-xl ">
                        We&apos;d love to hear from you. Here&apos;s how you can
                        reach us.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {CONTACTTYPE.map(({ icon, title, description }) => (
                        <div
                            className="group transform cursor-pointer rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:hover:bg-gray-700"
                            key={title}
                        >
                            <FeatureCard icon={icon} title={title}>
                                {description}
                            </FeatureCard>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
