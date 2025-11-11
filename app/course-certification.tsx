'use client';

import CourseInfoCard from '@/components/Custom/horizontal-card';
import AboutusImageBackgroundCard from './aboutus/aboutus-image-back';

const CERT_COURSES = [
    {
        heading: 'Level 1',
        title: 'Basic Caregiving Skills',
        duration: '4-6 weeks',

        desc: ' Course Description: This introductory level course provides essential training in basic caregiving skills for individuals new to the field of elderly care.',
    },
    {
        heading: 'Level 2',
        duration: '4-6 weeks',
        title: 'Intermediate Caregiving Techniques',
        desc: 'Building upon the foundational skills learned in Level 1, this intermediate level course delves deeper into caregiving techniques and strategies.',
    },
    {
        heading: 'Level 3',
        duration: '4-6 weeks',
        title: 'Advanced Elderly Care Practices',
        desc: 'Building upon the foundational skills learned in Level 1, this intermediate level course delves deeper into caregiving techniques and strategies..',
    },
    {
        heading: 'Level 4',
        duration: '4-6 weeks',
        title: 'Professional Elderly Care Practices',
        desc: 'Building upon the foundational skills learned in Level 1, this intermediate level course delves deeper into caregiving techniques and strategies..',
    },
    {
        heading: 'Level 5',
        duration: '4-6 weeks',
        title: 'Professional Elderly Care Practices',
        desc: 'Building upon the foundational skills learned in Level 1, this intermediate level course delves deeper into caregiving techniques and strategies..',
    },
];

export function CertificationCourses() {
    return (
        <section className="animate-fade-down bg-gray-100 duration-500">
            <div className="flex flex-wrap justify-start">
                {/* <!-- Left Column: Course Information --> */}
                <div className="flex w-full flex-col justify-center p-4 md:w-1/2">
                    <h3 className="mb-4 animate-fade text-center font-bold text-3xl text-black duration-500 md:text-left">
                        Level I to V Certification
                    </h3>
                    <p className="mb-4 animate-fade px-3 text-left font-normal text-gray-600 text-lg duration-500 lg:px-0">
                        Our certification courses include the following
                        services:
                    </p>
                    <ul className="animate-fade list-inside list-disc px-3 text-left font-normal text-gray-600 text-lg duration-500 lg:px-0">
                        <li>Comprehensive reading materials</li>
                        <li>Interactive classes and sessions</li>
                        <li>Practical classes with field visits</li>
                        <li>Certification exams</li>
                        <li>Interview classes</li>
                        <li>Job placement sponsorship</li>
                        <li>Continuous support and guidance</li>
                    </ul>
                </div>

                <div className="w-full p-4 md:w-1/2">
                    <AboutusImageBackgroundCard image="image/aboutus2.jpg" />
                </div>

                <div className="container mx-auto mt-10 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-1 xl:grid-cols-2">
                    {CERT_COURSES.map((props, _: number) => (
                        <CourseInfoCard key={props.title} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CertificationCourses;
