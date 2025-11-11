'use client';

import {
    AcademicCapIcon,
    CheckBadgeIcon,
    InboxIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import FeatureCard from '@/components/Custom/feature-card';

export function OurServices() {
    const FEATURES = [
        {
            icon: InboxIcon,
            title: 'Comprehensive Caregiver Training Packages',
            description:
                'Are you passionate about providing compassionate care to the elderly? Our comprehensive caregiver training packages are designed to equip you with the essential skills and knowledge needed to excel in the field of elderly care.',
        },
        {
            icon: AcademicCapIcon,
            title: 'Personalized Career Guidance and Support',
            description:
                'Ready to take the next step in your career in elderly care? Our personalized career guidance and support services are here to help you navigate your professional journey with confidence.',
        },
        {
            icon: CheckBadgeIcon,
            title: 'Specialized Elderly Care Services:',
            description:
                'Looking for specialized care for yourself or a loved one? Our Elderly Care Services at Hope International are designed to provide compassionate and personalized support for seniors facing a variety of age-related challenges.',
        },
    ];

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <section
            className="relative bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28 dark:bg-gray-900"
            ref={ref}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 opacity-50 dark:from-gray-900 dark:to-gray-800" />
            <div className="container relative z-10 mx-auto">
                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="mb-16 text-center"
                    initial="hidden"
                    variants={containerVariants}
                >
                    <motion.h2
                        className="font-extrabold text-3xl text-gray-900 sm:text-4xl md:text-5xl dark:text-white"
                        variants={itemVariants}
                    >
                        Our Special Services
                    </motion.h2>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-gray-500 text-xl dark:text-gray-400"
                        variants={itemVariants}
                    >
                        Learn from experienced professionals who are passionate
                        about sharing their knowledge and expertise in elderly
                        care.
                    </motion.p>
                </motion.div>

                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    variants={containerVariants}
                >
                    {FEATURES.map(({ icon, title, description }) => (
                        <motion.div
                            className="group hover:-translate-y-2 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800/50"
                            key={title}
                            variants={itemVariants}
                        >
                            <FeatureCard icon={icon} title={title}>
                                {description}
                            </FeatureCard>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

export default OurServices;
