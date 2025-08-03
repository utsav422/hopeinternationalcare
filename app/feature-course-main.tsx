'use client';

import Image from 'next/image';

const CourseList = [
  {
    image: '/image/course1.jpeg',
    title: 'Level I to V certification',
  },
  {
    image: '/image/course2.jpeg',
    title: 'Child Development Education ',
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
    title: 'Interview Package ',
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
  const _handleClick = () => {
    window.location.href = '/courses';
  };

  return (
    //  < !--Main Section-- >
    <section className="items-center light:bg-gray-100 py-18 dark:bg-white">
      <div className="container mx-auto grid animate-fade grid-cols-1 place-items-center gap-10 duration-500 lg:grid-cols-3">
        <div className="col-span-3 items-center lg:py-20">
          {/* <!-- Title --> */}

          <h2 className="mb-4 animate-fade animate-fade text-center font-bold text-4xl text-black duration-500">
            Our Courses
          </h2>
          {/* <!-- Subtitle --> */}
          <h6 className="!text-black-500 mb-4 animate-fade animate-fade px-3 text-center font-normal text-gray-600 text-lg duration-500 lg:px-0">
            Explore our various courses and make yourself market ready for
            abroad preparation and jobs.
          </h6>
          {/* <!-- Course Grid --> */}

          <div className="col-span-2 mt-20 grid animate-fade animate-fade grid-cols-1 justify-center gap-x-10 duration-500 sm:grid-cols-4">
            {CourseList.map(({ image, title }) => (
              <div
                className="mb-10 flex flex-col items-center pr-10"
                key={title}
              >
                <div className="relative h-48 w-48 transform overflow-hidden border-4 border-teal-500 transition-transform duration-300 hover:scale-105">
                  <Image
                    alt={`${title} testimonial image`}
                    className="h-full w-full object-cover"
                    height={192}
                    src={image}
                    width={192}
                  />
                </div>
                <h5 className="!text-black-500 mt-4 mb-2 animate-fade animate-fade text-center font-bold text-gray-700 text-lg duration-500">
                  {title}
                </h5>
              </div>
            ))}
          </div>
          {/* <!--Link Button --> */}
          <div className="mt-10 flex justify-center">
            <a
              className="rounded-full bg-teal-500 px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-teal-600"
              href="/courses"
            >
              SEE MORE
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurCoursesOverview;
