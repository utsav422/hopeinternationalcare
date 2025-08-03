'use client';

import AboutusImageBackgroundCard from './aboutus-image-back';

export function AboutUsDetails() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 h-full w-full bg-white-700" />
      <section className="mx-auto flex w-full max-w-4xl animate-fade-down flex-col items-center px-3 py-10 duration-500">
        <div className="container relative z-10 mx-auto my-auto grid place-items-center text-center">
          <div className="flex flex-wrap items-center justify-center">
            <div className="mt-10 lg:w-1/2">
              <AboutusImageBackgroundCard image="image/bg1.jpg" />
            </div>

            <div className="w-full lg:w-1/2">
              <h2 className="mt-10 mb-5 w-full animate-fade-down text-center font-bold text-2xl text-black duration-500 lg:w-10/12">
                About Company
              </h2>

              <p className="mb-2 ml-10 w-full animate-fade-down text-left font-normal text-black text-lg duration-500 lg:w-20/20">
                Welcome to Hope International Aged Care Training and Elderly
                Care Center, nestled in the vibrant heart of Kathmandu, Nepal.
                Our center stands as a beacon of compassion and excellence in
                caregiver training and elderly care services. Located in the
                bustling district of Kathmandu, we are committed to empowering
                individuals with the skills and knowledge necessary to provide
                exceptional care to elderly members of our community.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center">
            <div className="w-full lg:w-1/2">
              <h2 className="mt-10 mb-5 w-full animate-fade-down text-center font-bold text-2xl text-black duration-500 lg:w-10/12">
                What We Do
              </h2>

              <p className="w-full animate-fade-down text-left font-normal text-black text-lg duration-500 lg:w-20/20">
                At Hope International, we offer comprehensive caregiver training
                packages tailored to levels 1 through 5, ensuring that our
                trainees are equipped with the expertise needed to meet the
                diverse needs of aging individuals. Our curriculum covers a wide
                range of topics, including basic caregiving techniques,
                specialized care for individuals with conditions such as
                Alzheimer's, Parkinson's, dementia, and more.
              </p>
            </div>

            <div className="mt-10 lg:w-1/2">
              <div className="ml-10">
                <AboutusImageBackgroundCard image="image/aboutus2.jpg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
