'use client';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

export default function Hero() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div
            ref={ref}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
        >
            <motion.div
                animate={inView ? 'visible' : 'hidden'}
                className="max-w-4xl"
                initial="hidden"
                transition={{ duration: 0.5 }}
                variants={variants}
            >
                {/* Main Title */}
                <motion.h1
                    className="font-extrabold text-3xl text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl"
                    transition={{ duration: 0.5, delay: 0.2 }}
                    variants={variants}
                >
                    Hope International Aged Care Training And Elderly Care
                    Center
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className="mx-auto mt-4 max-w-2xl text-gray-200 text-sm sm:text-base md:text-lg md:mt-6 lg:text-xl dark:text-gray-300"
                    transition={{ duration: 0.5, delay: 0.4 }}
                    variants={variants}
                >
                    We offer courses from level 1 to level 5 where we provide
                    theoretical and practical classes. Hurry up! Only limited
                    seats are available.
                </motion.p>

                {/* Button with Link Component */}
                <motion.div
                    className="mt-8 md:mt-10 flex justify-center items-center gap-8 flex-col"
                    transition={{ duration: 0.5, delay: 0.6 }}
                    variants={variants}
                >
                    <Link href="/contactus">
                        <button
                            className="rounded-full bg-teal-500 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800 sm:px-8 sm:py-4"
                            type="button"
                        >
                            ENROLL NOW
                        </button>
                    </Link>
                    {/* Animated Down Arrow */}
                    <div className="animate-bounce">
                        <ChevronDown className="h-6 w-6 text-white/70 sm:h-8 sm:w-8" />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
