'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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
        <section className="bg-gray-50 py-20 sm:py-28 dark:bg-gray-900" ref={ref}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="mb-16 text-center"
                    initial="hidden"
                    variants={containerVariants}
                >
                    <motion.h2
                        className="font-extrabold text-3xl text-gray-900 sm:text-4xl md:text-5xl "
                        variants={itemVariants}
                    >
                        Our Courses
                    </motion.h2>
                    <motion.p
                        className="mx-auto mt-4 max-w-2xl text-gray-600 text-xl "
                        variants={itemVariants}
                    >
                        Explore our various courses and make yourself market ready for
                        abroad preparation and jobs.
                    </motion.p>
                </motion.div>

                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 md:gap-10 lg:grid-cols-5 xl:grid-cols-7"
                    initial="hidden"
                    variants={containerVariants}
                >
                    {CourseList.map(({ image, title }) => (
                        <motion.div
                            className="group flex flex-col items-center text-center"
                            key={title}
                            variants={itemVariants}
                        >
                            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-teal-500 shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-40 sm:w-40 dark:border-teal-400">
                                <Image
                                    alt={`${title} course image`}
                                    layout="fill"
                                    objectFit="cover"
                                    sizes="(max-width: 640px) 128px, 160px"
                                    src={image}
                                />
                            </div>
                            <h3 className="mt-4 font-bold text-base text-gray-800 transition-colors duration-300 group-hover:text-teal-600 sm:text-lg  dark:group-hover:text-teal-400">
                                {title}
                            </h3>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    animate={inView ? 'visible' : 'hidden'}
                    className="mt-20 flex justify-center"
                    initial="hidden"
                    transition={{ delay: 0.5 }}
                    variants={itemVariants}
                >
                    <Link href="/courses">
                        <button
                            className="rounded-full bg-teal-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800"
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
