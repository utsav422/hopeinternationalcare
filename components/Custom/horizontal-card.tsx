'use client';

import Image from 'next/image';

interface CourseInfoCardProps {
  heading: string;
  title: string;
  desc: string;
  duration: string;
}

export function CourseInfoCard({
  heading,
  title,
  desc,
  duration,
}: CourseInfoCardProps) {
  return (
    <div className="relative flex w-full transform rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg shadow-md transition duration-300 hover:scale-105">
      <div className="relative m-0 w-2/5 shrink-0 overflow-hidden rounded-xl rounded-r-none bg-white bg-clip-border text-gray-700">
        <Image
          alt="card-image"
          className="h-full w-full object-cover"
          src="/image/aboutusbg.jpg"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-black bg-opacity-50 text-lg text-white">
          <div className="font-bold font-sans text-xl">{heading}</div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-clock" />
            <span className="font-sans text-l">{duration}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h4 className="mb-2 block font-sans font-semibold text-gray-900 text-xl leading-snug tracking-normal antialiased">
          {title}
        </h4>
        <p className="block font-normal font-sans text-base text-gray-700 leading-relaxed antialiased">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default CourseInfoCard;
