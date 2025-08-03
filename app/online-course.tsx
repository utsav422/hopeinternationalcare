'use client';

import {
  AcademicCapIcon,
  CheckBadgeIcon,
  InboxIcon,
} from '@heroicons/react/24/solid';

import FeatureCard from '@/components/Custom/feature-card';

export function OnlineCourse() {
  const FEATURES = [
    {
      icon: InboxIcon,
      title: 'Comprehensive Caregiver Training Packages',
      description:
        'Are you passionate about providing compassionate care to the elderly? Our comprehensive caregiver training packages are designed to equip you with the essential skills and knowledge needed to excel in the field of elderly care.',
    },
    {
      icon: AcademicCapIcon,
      title: 'Personalized Career Guidance and Support',
      description:
        'Ready to take the next step in your career in elderly care? Our personalized career guidance and support services are here to help you navigate your professional journey with confidence.',
    },
    {
      icon: CheckBadgeIcon,
      title: 'Specialized Elderly Care Services:',
      description:
        'Looking for specialized care for yourself or a loved one? Our Elderly Care Services at Hope International are designed to provide compassionate and personalized support for seniors facing a variety of age-related challenges.',
    },
  ];

  return (
    <section className="bg-white px-8 py-28">
      <div className="container mx-auto grid animate-fade grid-cols-1 place-items-center duration-500 lg:grid-cols-3">
        {/* Content Section */}
        <div className="col-span-3 lg:pr-10">
          {/* Main Title */}
          <h2 className="mb-4 animate-fade text-center font-bold text-4xl text-black duration-500">
            Our Special Services
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mb-16 w-full text-center font-normal text-gray-600 text-lg lg:w-10/12">
            Learn from experienced professionals who are passionate about
            sharing their knowledge and expertise in elderly care.
          </p>

          <div className="mt-10 grid animate-fade grid-cols-1 gap-10 duration-500 sm:grid-cols-3">
            {FEATURES.map(({ icon, title, description }, index) => (
              <div
                className="cursor-pointer rounded-lg bg-white p-6 shadow-lg transition-colors duration-300 hover:bg-teal-100"
                key={index + title}
              >
                <FeatureCard icon={icon} key={title} title={title}>
                  {description}
                </FeatureCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OnlineCourse;
