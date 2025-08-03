'use client'; // Mark this as a Client Component [[3]]

import Link from 'next/link'; // Import the Link component [[2]]
import { useEffect, useState } from 'react';

const carouselImages = ['/image/bg1.jpg', '/image/bg2.jpg'];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1
      );
    }, 3000);

    return () => clearInterval(interval); // Cleanup interval on unmount
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

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 h-full w-full">
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${carouselImages[currentSlide]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 1,
          }}
        />
      </div>
      <div className="absolute inset-0 h-full w-full bg-gray-900/50" />

      {/* Content */}
      <div className="grid min-h-screen px-8">
        <div className="container relative z-10 mx-auto my-auto grid place-items-center text-center">
          {/* Main Title */}
          <h2 className="animate-fade font-bold text-4xl text-white duration-500 md:max-w-full md:text-5xl lg:max-w-3xl lg:text-6xl">
            Hope International Aged Care Training And Elderly Care Center
          </h2>

          {/* Subtitle */}
          <p className="mt-6 mb-10 w-full animate-fade text-lg text-white duration-500 md:max-w-full md:text-xl lg:max-w-2xl lg:text-2xl">
            We offer courses from level 1 to level 5 where we provide
            theoretical and practical classes. Hurry up! Only limited seats are
            available.
          </p>

          {/* Button with Link Component */}
          <div className="animate-fade-down duration-500">
            <Link href="/contactus">
              <button
                className="rounded-full bg-teal-500 px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-teal-600"
                type="button"
              >
                ENROLL NOW
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="-translate-y-1/2 absolute top-1/2 left-4 z-20 transform rounded-full bg-white bg-opacity-50 p-2 hover:bg-opacity-75"
        onClick={handlePrevClick}
        type="button"
      >
        <svg
          className="h-6 w-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Previous Slide</title>
          <path
            d="M15 19l-7-7 7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
      <button
        className="-translate-y-1/2 absolute top-1/2 right-4 z-20 transform rounded-full bg-white bg-opacity-50 p-2 hover:bg-opacity-75"
        onClick={handleNextClick}
        type="button"
      >
        <svg
          className="h-6 w-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Next Slide</title>
          <path
            d="M9 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  );
}
