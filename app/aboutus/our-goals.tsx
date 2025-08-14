'use client';

import {
    CheckBadgeIcon,
    EyeIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline';

const FEATURES = [
    {
        icon: RocketLaunchIcon,
        title: 'Mission',
        description:
            'To empower caregivers with comprehensive training and support, and to provide compassionate and specialized care to elderly individuals, enhancing their quality of life and promoting their well-being.',
    },
    {
        icon: EyeIcon,
        title: 'Vision',
        description:
            'We aim to establish a one-of-a-kind care home dedicated to providing exceptional care for seniors with various age-related challenges, setting the standard for eldercare in Nepal.',
    },
    {
        icon: CheckBadgeIcon,
        title: 'Objectives',
        description:
            'Provide comprehensive caregiver training packages covering levels 1 to 5, ensuring that trainees are equipped with the necessary skills and knowledge to deliver exceptional care to elderly individuals',
    },
];

export function OurGoals() {
    return (
        <section className="bg-gray-100 px-8 py-28 dark:bg-gray-800">
            <div className="container mx-auto grid animate-fade grid-cols-1 place-items-center gap-10 duration-500 lg:grid-cols-3">
                <div className="col-span-3 text-center">
                    <h1 className="mb-4 animate-fade-down font-bold text-4xl text-gray-900 duration-500 dark:text-white">
                        Our Future Goals
                    </h1>
                    <p className="mb-8 animate-fade-up px-3 font-normal text-gray-700 text-lg duration-500 lg:px-0 dark:text-gray-300">
                        Looking towards the future, our vision extends beyond training and
                        guidance. We aspire to establish a one-of-a-kind care home on the
                        outskirts of a prominent city in Nepal, dedicated to providing
                        compassionate and specialized care for elderly individuals facing
                        various age-related challenges. This facility will be a sanctuary
                        where residents receive not only the physical care they need but
                        also the emotional support and companionship that are essential for
                        their well-being.
                    </p>
                </div>

                <div className="col-span-3 mt-10 grid animate-fade-in grid-cols-1 gap-10 duration-500 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <div
                            className="transform cursor-pointer rounded-lg bg-white p-6 shadow-md transition-transform duration-300 hover:scale-105 hover:bg-teal-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                            key={title}
                        >
                            <div className="flex flex-col items-center text-center">
                                <Icon className="mb-4 h-12 w-12 text-teal-500 dark:text-teal-400" />
                                <h3 className="mb-3 font-semibold text-gray-900 text-xl dark:text-white">
                                    {title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default OurGoals;
