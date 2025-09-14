'use client';

import Image from "next/image";
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

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
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="px-4 pt-10 pb-10 sm:px-6 lg:px-8">

            <div className="mb-12 flex flex-col items-center text-center sm:mb-16">
                <h2 className="mb-2 font-bold text-2xl text-gray-800 dark:text-white sm:text-3xl md:text-4xl">
                    What Students Say
                </h2>
                <p className="mb-3 w-full font-normal text-gray-600 text-base sm:text-lg md:text-xl lg:w-10/12">
                    Discover what our students have to say about our course!
                </p>
            </div>

            <div className="container relative mx-auto rounded-lg bg-[url('/image/logo_tp.png')] bg-auto bg-teal-700 bg-no-repeat py-8 opacity-90 sm:py-10 md:py-12 lg:px-8 lg:py-16">
                <div className="relative">
                    {testimonials.map((testimonial, i: number) => (
                        <div
                            className={`transition-opacity duration-1000 ${activeIndex === i ? 'opacity-100' : 'opacity-0'
                                } ${activeIndex === i ? 'block' : 'hidden'}`}
                            key={testimonial.name}
                        >
                            <div className="relative flex flex-col-reverse gap-6 px-6 py-8 sm:px-10 sm:py-10 md:grid md:grid-cols-5 md:gap-8 md:py-16 lg:gap-14">
                                <div className="col-span-3 flex flex-col items-start justify-center">
                                    <p
                                        className={`mb-4 max-w-prose font-bold text-white text-base sm:text-lg md:text-xl before:mr-1 before:text-lg before:opacity-60 before:content-['"'] after:ml-1 after:text-lg after:opacity-60 after:content-['"'] sm:before:text-xl sm:after:text-xl`}
                                    >
                                        {testimonial.quote}
                                    </p>
                                    <p className="font-medium text-xs text-white uppercase sm:text-sm">
                                        {testimonial.name},{' '}
                                        <span className="font-normal opacity-60">
                                            {testimonial.title}
                                        </span>
                                    </p>
                                </div>
                                <div className="col-span-2 flex w-full shrink-0 justify-center md:justify-end">
                                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white sm:h-40 sm:w-40 md:h-48 md:w-48">
                                        <Image unoptimized={true}
                                            alt={`${testimonial.name} testimonial image`}
                                            className="h-full w-full object-cover"
                                            fill
                                            src={testimonial.image}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 transform space-x-2">
                        {testimonials.map((ttmls, i: number) => (
                            <button
                                aria-label={`Show testimonial ${i + 1}`}
                                className={`block h-1 w-8 cursor-pointer transition-all sm:w-10 ${activeIndex === i ? 'bg-white' : 'bg-white/50'
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
