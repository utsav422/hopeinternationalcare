'use client';

import { motion } from 'framer-motion';
import Image from "next/image";
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

const CourseList = [
    {
        image: '/image/course1.jpeg',
        title: 'Level I to V certification',
    },
    {
        image: '/image/course2.jpeg',
        title: 'Child Development Education',
    },
    {
        image: '/image/course3.jpg',
        title: 'Hospitality Management',
    },
    {
        image: '/image/bg.jpeg',
        title: 'Disease Condition Package',
    },
    {
        image: '/image/course5.jpg',
        title: 'Interview Package',
    },
    {
        image: '/image/course6.jpg',
        title: 'Prevailed Package',
    },
    {
        image: '/image/course7.jpg',
        title: 'English Course (IELTS / PTE)',
    },
];

export function OurCoursesOverview() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <section className="bg-gray-50 py-16 sm:py-20 md:py-28 dark:bg-gray-900" ref={ref}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="mb-12 text-center sm:mb-16"
                    initial="hidden"
                    variants={containerVariants}
                >
                    <motion.h2
                        className="font-extrabold text-2xl text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white"
                        variants={itemVariants}
                    >
                        Our Courses
                    </motion.h2>
                    <motion.p
                        className="mx-auto mt-3 max-w-2xl text-gray-600 text-sm sm:text-base md:text-lg md:mt-4 lg:text-xl dark:text-gray-400"
                        variants={itemVariants}
                    >
                        Explore our various courses and make yourself market ready for
                        abroad preparation and jobs.
                    </motion.p>
                </motion.div>

                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 md:gap-8 lg:grid-cols-5 xl:grid-cols-7"
                    initial="hidden"
                    variants={containerVariants}
                >
                    {CourseList.map(({ image, title }) => (
                        <motion.div
                            className="group flex flex-col items-center text-center"
                            key={title}
                            variants={itemVariants}
                        >
                            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-teal-500 shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-32 sm:w-32 md:h-40 md:w-40 dark:border-teal-400">
                                <Image
                                    alt={`${title} course image`}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    width={160}
                                    height={160}
                                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 160px"
                                    src={image}
                                    unoptimized={true}
                                />
                            </div>
                            <h3 className="mt-3 font-bold text-xs text-gray-800 transition-colors duration-300 group-hover:text-teal-600 sm:mt-4 sm:text-sm md:text-base dark:text-gray-200 dark:group-hover:text-teal-400">
                                {title}
                            </h3>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="mt-12 flex justify-center sm:mt-16 md:mt-20"
                    initial="hidden"
                    transition={{ delay: 0.5 }}
                    variants={itemVariants}
                >
                    <Link href="/courses">
                        <button
                            className="rounded-full bg-teal-500 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800 sm:px-8 sm:py-4"
                            type="button"
                        >
                            SEE MORE
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

export default OurCoursesOverview;
