'use client';
import Image from 'next/image';

interface CourseCardProps {
  heading: string;
  title: string;
  desc: string;
  buttonLabel: string;
}

export function FeatureCourseCard({
  heading,
  title,
  desc,
  buttonLabel: _,
}: CourseCardProps) {
  return (
    <div className="flex flex-row items-center space-x-4">
      <div className="transform bg-white transition duration-300 hover:scale-105">
        <div className="mx-0 mt-0 mb-6 h-48 w-48">
          <div className="relative h-full w-full">
            <Image
              alt={title}
              className="h-full w-full object-cover"
              height={768}
              src={'/image/aboutusbg.jpg'}
              width={768}
            />
            <div className="absolute inset-0 flex items-center justify-center text-center text-white">
              <h1 className="font-bold text-4xl">{heading}</h1>
            </div>
          </div>
        </div>
        <div className="p-0">
          <a
            className="text-gray-900 transition-colors hover:text-blue-600"
            href="/courses"
          >
            <h5 className="mb-2 font-semibold text-xl">{title}</h5>
          </a>
          <p className="mb-6 font-normal text-gray-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default FeatureCourseCard;
