'use client';

import { CourseCard } from '@/components/Custom';

const OTHER_COURSES = [
  {
    heading: '/image/course2.jpeg',
    title: 'Child Development Education ',
    desc: 'Child Development Education focuses on understanding and supporting the physical, cognitive, emotional, and social growth of children from birth through adolescence.',
  },
  {
    heading: '/image/course3.jpg',
    title: 'Hospitality Management',
    desc: 'Hospitality management involves overseeing the operations of hospitality establishments such as hotels, resorts, restaurants, and event planning services.',
  },
  {
    heading: '/image/bg.jpeg',
    title: 'Disease Condition Package',
    desc: 'A Disease Condition Package is a comprehensive healthcare plan designed to manage and treat specific chronic or acute medical conditions.',
  },
  {
    heading: '/image/course5.jpg',
    title: 'Interview Package ',
    desc: 'We offer specialized interview classes for caregiver job placement and exam preparation. These classes are designed to help caregivers excel in job interviews and meet the requirements of relevant certification exams.',
  },
  {
    heading: '/image/course6.jpg',
    title: 'Prevailed Package',
    desc: 'A Prevailed Package is a curated healthcare plan aimed at preventing diseases and maintaining optimal health. These packages typically include a variety of preventive services such as regular health check-ups, screenings, vaccinations, lifestyle and nutritional counseling, and wellness programs.',
  },
  {
    heading: '/image/course7.jpg',
    title: 'English Course (IELTS / PTE)',
    desc: 'The English Course (IELTS / PTE) for Age Caregivers is specifically designed to help individuals working in the age care sector improve their English language proficiency.',
  },
];

export function OtherCourses() {
  return (
    <section className="bg-gray-100 px-10 py-8">
      <div className="col-span-3 lg:py-20">
        <h1 className="mb-4 animate-fade text-left font-bold text-3xl text-black duration-500">
          Other Courses
        </h1>
        <p className="mb-4 animate-fade px-3 text-left font-normal text-gray-700 text-lg duration-500 lg:px-0">
          Find out other courses and packages we offer to enhance your skills
          and become a market ready care giver professional.
        </p>

        <div className="container mx-auto mt-20 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-1 xl:grid-cols-3">
          {OTHER_COURSES.map((props, _: number) => (
            <CourseCard key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default OtherCourses;
