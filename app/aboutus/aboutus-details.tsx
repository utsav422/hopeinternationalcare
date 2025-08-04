'use client';

import AboutusImageBackgroundCard from './aboutus-image-back';

export function AboutUsDetails() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          <div className="w-full lg:w-1/2">
            <AboutusImageBackgroundCard image="/image/bg1.jpg" />
          </div>

          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl md:text-5xl mb-6">
              About Company
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to Hope International Aged Care Training and Elderly Care Center, nestled in the vibrant heart of Kathmandu, Nepal. Our center stands as a beacon of compassion and excellence in caregiver training and elderly care services. Located in the bustling district of Kathmandu, we are committed to empowering individuals with the skills and knowledge necessary to provide exceptional care to elderly members of our community.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row-reverse items-center justify-center gap-12">
          <div className="w-full lg:w-1/2">
            <AboutusImageBackgroundCard image="/image/aboutus2.jpg" />
          </div>

          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl md:text-5xl mb-6">
              What We Do
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              At Hope International, we offer comprehensive caregiver training packages tailored to levels 1 through 5, ensuring that our trainees are equipped with the expertise needed to meet the diverse needs of aging individuals. Our curriculum covers a wide range of topics, including basic caregiving techniques, specialized care for individuals with conditions such as Alzheimer's, Parkinson's, dementia, and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}