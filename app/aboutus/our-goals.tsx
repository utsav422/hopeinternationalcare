'use client';

import {
  CheckBadgeIcon,
  CheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const FEATURES = [
  {
    icon: CheckIcon,
    title: 'Mission',
    description:
      'To empower caregivers with comprehensive training and support, and to provide compassionate and specialized care to elderly individuals, enhancing their quality of life and promoting their well-being.',
  },
  {
    icon: EyeIcon,
    title: 'Vision',
    description:
      'We aim to establish a one-of-a-kind care home dedicated to providing exceptional care for seniors with various age-related challenges, setting the standard for eldercare in Nepal.',
  },
  {
    icon: CheckBadgeIcon,
    title: 'Objectives',
    description:
      'Provide comprehensive caregiver training packages covering levels 1 to 5, ensuring that trainees are equipped with the necessary skills and knowledge to deliver exceptional care to elderly individuals',
  },
];

export function OurGoals() {
  return (
    <section className="bg-gray-100 px-8 py-28">
      <div className="container mx-auto grid animate-fade grid-cols-1 place-items-center duration-500 lg:grid-cols-3">
        <div className="col-span-3 lg:pl-24">
          <h1 className="mb-4 animate-fade text-center font-bold text-4xl duration-500">
            Our Future Goals
          </h1>
          <p className="mb-4 animate-fade px-3 text-center font-normal text-gray-700 text-lg duration-500 lg:px-0">
            Looking towards the future, our vision extends beyond training and
            guidance. We aspire to establish a one-of-a-kind care home on the
            outskirts of a prominent city in Nepal, dedicated to providing
            compassionate and specialized care for elderly individuals facing
            various age-related challenges. This facility will be a sanctuary
            where residents receive not only the physical care they need but
            also the emotional support and companionship that are essential for
            their well-being.
          </p>

          <div className="col-span-2 mt-10 grid animate-fade grid-cols-1 gap-10 duration-500 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }, _: number) => (
              <div
                className="animate-fade cursor-pointer rounded-lg bg-white p-6 shadow-md duration-500 hover:bg-teal-100"
                key={title}
              >
                <div className="flex flex-col items-center">
                  <Icon className="mb-4 h-12 w-12 text-teal-500" />
                  <h3 className="mb-3 font-semibold text-xl">{title}</h3>
                  <p className="text-center text-gray-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurGoals;
