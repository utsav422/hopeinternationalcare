'use client';
import { BookOpenIcon, GiftIcon, UserIcon } from '@heroicons/react/24/outline';
import type React from 'react';
import ImageBackgroundCard from '@/components/Custom/image-bg-card';

interface OptionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

function Option({ icon: Icon, title, children }: OptionProps) {
  return (
    <div className="transform animate-fade-down rounded-lg bg-white p-6 shadow-lg transition duration-300 hover:scale-105 hover:bg-teal-100">
      <div className="flex gap-4">
        <div className="mb-4">
          <Icon className="size-8 text-gray-900" />
        </div>
        <div>
          <h5 className="mb-2 transform font-semibold text-gray-900 text-xl transition duration-300 hover:scale-105">
            {title}
          </h5>
          <p className="font-normal text-gray-700 text-sm md:w-10/12">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WhyChooseUs() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-10 ">
      {/* Main Title */}
      <h2 className="mb-2 animate-fade-down text-center font-bold text-4xl text-gray-900 duration-500">
        Why choose our course?
      </h2>

      {/* Subtitle */}
      <p className="mb-16 w-full text-center font-normal text-gray-600 text-lg lg:w-10/12">
        Discover the unique advantages, benefits, and standout features that set
        our course apart from the rest.
      </p>

      {/* Content Grid */}
      <div className="mt-4 mb-6 grid grid-cols-1 items-center gap-4 md:grid-cols-2">
        {/* Left Column: Image Background Card */}
        <ImageBackgroundCard image="Comprehensive Packages">
          We offer comprehensive caregiver training packages tailored to levels
          1 through 5, ensuring that our trainees are equipped with the
          expertise needed to meet the diverse needs of aging individuals.
        </ImageBackgroundCard>

        {/* Right Column: Options */}
        <div className="space-y-4">
          {/* Option 1 */}
          <Option icon={GiftIcon} title="Comprehensive Packages">
            We offer comprehensive caregiver training packages tailored to
            levels 1 through 5, ensuring that our trainees are equipped with the
            expertise needed to meet the diverse needs of aging individuals.
          </Option>

          {/* Option 2 */}
          <Option icon={BookOpenIcon} title="Curriculum and Contents">
            Our curriculum covers a wide range of topics, including basic
            caregiving techniques, specialized care for individuals with
            conditions such as Alzheimer’s, Parkinson’s, dementia, and more.
          </Option>

          {/* Option 3 */}
          <Option icon={UserIcon} title="Personalized Career Guidance">
            We believe in guiding our trainees towards fulfilling and rewarding
            careers in elderly care. Through personalized career guidance and
            support, we help individuals navigate their professional paths with
            confidence and purpose.
          </Option>
        </div>
      </div>
    </section>
  );
}
