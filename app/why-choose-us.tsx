'use client';
import { BookOpenIcon, GiftIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import type React from 'react';
import { useInView } from 'react-intersection-observer';
import ImageBackgroundCard from '@/components/Custom/image-bg-card';

interface OptionProps {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}

function Option({ icon: Icon, title, children }: OptionProps) {
    return (
        <div className="transform rounded-lg bg-white p-6 shadow-lg transition duration-300 hover:scale-105 hover:bg-teal-50 dark:bg-gray-800 dark:hover:bg-gray-700">
            <div className="flex gap-4">
                <div className="mb-4">
                    <Icon className="size-8 text-teal-500 dark:text-teal-400" />
                </div>
                <div>
                    <h5 className="mb-2 font-semibold text-gray-900 text-xl ">
                        {title}
                    </h5>
                    <p className="font-normal text-gray-700 text-sm md:w-10/12 dark:text-gray-300">
                        {children}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function WhyChooseUs() {
    const images = [
        '/image/2.jpeg',
        '/image/3.jpeg',
        '/image/4.jpeg',
        '/image/5.jpeg',
        '/image/group2.jpeg',
        '/image/student2.jpeg',
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
            className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-10 sm:px-6 lg:px-8"
            ref={ref}
        >
            {/* Main Title */}
            <motion.h2
                animate={inView ? 'visible' : 'hidden'}
                className="mb-4 text-center font-extrabold text-3xl text-gray-900 sm:text-4xl md:text-5xl "
                initial="hidden"
                transition={{ duration: 0.5 }}
                variants={itemVariants}
            >
                Why choose our course?
            </motion.h2>

            {/* Subtitle */}
            <motion.p
                animate={inView ? 'visible' : 'hidden'}
                className="mb-16 max-w-2xl text-center font-normal text-gray-600 text-xl "
                initial="hidden"
                transition={{ duration: 0.5, delay: 0.2 }}
                variants={itemVariants}
            >
                Discover the unique advantages, benefits, and standout features that set
                our course apart from the rest.
            </motion.p>

            {/* Content Grid */}
            <motion.div
                animate={inView ? 'visible' : 'hidden'}
                className="grid grid-cols-1 items-center gap-8 md:grid-cols-2"
                initial="hidden"
                variants={containerVariants}
            >
                {/* Left Column: Image Background Card */}
                <motion.div variants={itemVariants}>
                    <ImageBackgroundCard images={images}>
                        {/* Content for the card can go here if needed, or remove children prop if not used */}
                    </ImageBackgroundCard>
                </motion.div>

                {/* Right Column: Options */}
                <motion.div className="space-y-6" variants={containerVariants}>
                    {/* Option 1 */}
                    <motion.div variants={itemVariants}>
                        <Option icon={GiftIcon} title="Comprehensive Packages">
                            We offer comprehensive caregiver training packages tailored to
                            levels 1 through 5, ensuring that our trainees are equipped with
                            the expertise needed to meet the diverse needs of aging
                            individuals.
                        </Option>
                    </motion.div>

                    {/* Option 2 */}
                    <motion.div variants={itemVariants}>
                        <Option icon={BookOpenIcon} title="Curriculum and Contents">
                            Our curriculum covers a wide range of topics, including basic
                            caregiving techniques, specialized care for individuals with
                            conditions such as Alzheimer’s, Parkinson’s, dementia, and more.
                        </Option>
                    </motion.div>

                    {/* Option 3 */}
                    <motion.div variants={itemVariants}>
                        <Option icon={UserIcon} title="Personalized Career Guidance">
                            We believe in guiding our trainees towards fulfilling and
                            rewarding careers in elderly care. Through personalized career
                            guidance and support, we help individuals navigate their
                            professional paths with confidence and purpose.
                        </Option>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}
