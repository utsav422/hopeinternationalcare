'use client';

import Image from 'next/image';
import Link from 'next/link';

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
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Our Courses
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400">
            Explore our various courses and make yourself market ready for abroad preparation and jobs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-8 md:gap-10">
          {CourseList.map(({ image, title }) => (
            <div key={title} className="group flex flex-col items-center text-center">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden border-4 border-teal-500 dark:border-teal-400 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={image}
                  alt={`${title} course image`}
                  layout="fill"
                  objectFit="cover"
                  sizes="(max-width: 640px) 128px, 160px"
                />
              </div>
              <h3 className="mt-4 font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 transition-colors duration-300 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                {title}
              </h3>
            </div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <Link href="/courses">
            <button
              className="rounded-full bg-teal-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:bg-teal-600 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800"
              type="button"
            >
              SEE MORE
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OurCoursesOverview;