'use client';

import Image from "next/legacy/image";
import { useEffect, useState } from 'react';

export function CarouselFeatures() {
  const testimonials = [
    {
      quote: 'Out standing course contents and experienced tutor.',
      name: 'Rija Khadki',
      title: 'Care Giver Student.',
      image: '/image/subina.jpeg',
    },
    {
      quote:
        'Fantastic course with great course content. I have learned so much in such a short period.',
      name: 'Subina Shrestha',
      title: 'Care Giver Student.',
      image: '/image/rija.jpeg',
    },
    {
      quote: 'I am very much satisfied with their course and teaching method.',
      name: 'Arju Dhungana',
      title: 'Care Giver Student.',
      image: '/image/arju.jpeg',
    },
    {
      quote: 'Good training center.',
      name: 'Sarita Giri',
      title: 'Care Giver Student.',
      image: '/image/sarita.jpeg',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full bg-gray-100 px-8 pt-10 pb-10">
      <div className="mb-16 flex flex-col items-center">
        <h2 className="mb-2 text-center font-bold text-4xl text-gray-800">
          What Students Say
        </h2>
        <p className="mb-3 w-full text-center font-normal text-gray-600 text-xl lg:w-10/12">
          Discover what our students have to say about our course!
        </p>
      </div>

      <div className="container relative mx-auto rounded-lg bg-[url('/image/logo_tp.png')] bg-auto bg-teal-700 bg-no-repeat py-10 opacity-90 lg:px-16">
        <div className="relative">
          {testimonials.map((testimonial, i: number) => (
            <div
              className={`transition-opacity duration-1000 ${
                activeIndex === i ? 'opacity-100' : 'opacity-0'
              } ${activeIndex === i ? 'block' : 'hidden'}`}
              key={testimonial.name}
            >
              <div className="relative flex flex-col-reverse gap-6 px-10 py-14 md:grid md:grid-cols-5 md:gap-14 md:py-20">
                <div className="col-span-3 flex flex-col items-start justify-center">
                  <p
                    className={`mb-5 max-w-prose font-bold text-white text-xl before:mr-1 before:text-2xl before:opacity-60 before:content-['"'] after:ml-1 after:text-2xl after:opacity-60 after:content-['"']`}
                  >
                    {testimonial.quote}
                  </p>
                  <p className="font-medium text-sm text-white uppercase">
                    {testimonial.name},{' '}
                    <span className="font-normal opacity-60">
                      {testimonial.title}
                    </span>
                  </p>
                </div>
                <div className="col-span-2 flex w-full shrink-0 md:justify-end">
                  <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-white">
                    <Image
                      alt={`${testimonial.name} testimonial image`}
                      className="h-full w-full object-cover"
                      height={192}
                      src={testimonial.image}
                      width={192}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="-translate-x-1/2 absolute bottom-0 left-1/2 flex transform space-x-2">
            {testimonials.map((ttmls, i: number) => (
              <button
                aria-label={`Show testimonial ${i + 1}`}
                className={`block h-1 w-10 cursor-pointer transition-all ${
                  activeIndex === i ? 'bg-white' : 'bg-white/50'
                }`}
                key={ttmls.name}
                onClick={() => setActiveIndex(i)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CarouselFeatures;
