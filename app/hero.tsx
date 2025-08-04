'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const carouselImages = ['/image/bg1.jpg', '/image/bg2.jpg'];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevClick = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? carouselImages.length - 1 : prevSlide - 1,
    );
  };

  const handleNextClick = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1,
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 h-full w-full">
        {carouselImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Background image ${index + 1}`}
            layout="fill"
            objectFit="cover"
            quality={85}
            className={`transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            priority={index === 0} // Preload the first image
          />
        ))}
      </div>
      <div className="absolute inset-0 h-full w-full bg-black/60 dark:bg-black/70" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Main Title */}
          <h1 className="animate-fade-up font-extrabold text-4xl text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            Hope International Aged Care Training And Elderly Care Center
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up mt-6 max-w-2xl mx-auto text-lg text-gray-200 dark:text-gray-300 sm:text-xl md:text-2xl animate-delay-300">
            We offer courses from level 1 to level 5 where we provide theoretical and practical classes. Hurry up! Only limited seats are available.
          </p>

          {/* Button with Link Component */}
          <div className="animate-fade-up mt-10 animate-delay-600">
            <Link href="/contactus">
              <button
                className="rounded-full bg-teal-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:bg-teal-600 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800"
                type="button"
              >
                ENROLL NOW
              </button>
            </Link>
          </div>
        </div>

        {/* Animated Down Arrow */}
        <div className="absolute bottom-10 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/70" />
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute top-1/2 left-4 z-20 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white transition-all duration-300 hover:bg-white/40 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/50 sm:left-6"
        onClick={handlePrevClick}
        type="button"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
      <button
        className="absolute top-1/2 right-4 z-20 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white transition-all duration-300 hover:bg-white/40 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/50 sm:right-6"
        onClick={handleNextClick}
        type="button"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
    </div>
  );
}