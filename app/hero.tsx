'use client';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from "next/legacy/image";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const carouselImages = ['/image/bg1.jpg', '/image/bg2.jpg'];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevClick = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? carouselImages.length - 1 : prevSlide - 1
    );
  };

  const handleNextClick = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1
    );
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" ref={ref}>
      {/* Background Image Carousel */}
      <div className="absolute inset-0 h-full w-full">
        {carouselImages.map((src, index) => (
          <Image
            alt={`Background image ${index + 1}`}
            className={`transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            key={src}
            layout="fill"
            objectFit="cover"
            priority={index === 0}
            quality={85}
            src={src} // Preload the first image
          />
        ))}
      </div>
      <div className="absolute inset-0 h-full w-full bg-black/60 dark:bg-black/70" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-4xl"
          initial="hidden"
          transition={{ duration: 0.5 }}
          variants={variants}
        >
          {/* Main Title */}
          <motion.h1
            className="font-extrabold text-4xl text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl"
            transition={{ duration: 0.5, delay: 0.2 }}
            variants={variants}
          >
            Hope International Aged Care Training And Elderly Care Center
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-gray-200 text-lg sm:text-xl md:text-2xl dark:text-gray-300"
            transition={{ duration: 0.5, delay: 0.4 }}
            variants={variants}
          >
            We offer courses from level 1 to level 5 where we provide
            theoretical and practical classes. Hurry up! Only limited seats are
            available.
          </motion.p>

          {/* Button with Link Component */}
          <motion.div
            className="mt-10"
            transition={{ duration: 0.5, delay: 0.6 }}
            variants={variants}
          >
            <Link href="/contactus">
              <button
                className="rounded-full bg-teal-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800"
                type="button"
              >
                ENROLL NOW
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated Down Arrow */}
        <div className="absolute bottom-10 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/70" />
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        aria-label="Previous Slide"
        className="-translate-y-1/2 absolute top-1/2 left-4 z-20 transform rounded-full bg-white/20 p-2 text-white transition-all duration-300 hover:scale-110 hover:bg-white/40 focus:outline-none focus:ring-4 focus:ring-white/50 sm:left-6"
        onClick={handlePrevClick}
        type="button"
      >
        <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
      <button
        aria-label="Next Slide"
        className="-translate-y-1/2 absolute top-1/2 right-4 z-20 transform rounded-full bg-white/20 p-2 text-white transition-all duration-300 hover:scale-110 hover:bg-white/40 focus:outline-none focus:ring-4 focus:ring-white/50 sm:right-6"
        onClick={handleNextClick}
        type="button"
      >
        <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
    </div>
  );
}
