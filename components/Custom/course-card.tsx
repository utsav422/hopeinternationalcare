'use client';
import Image from 'next/image';
import Link from 'next/link';

interface CourseCardProps {
  heading: string;
  slug: string;
  title: string;
  desc: string;
  price: number;
  next_intake_date: string | null;
  available_seats: number | null;
}

export function CourseCard({
  heading,
  slug,
  title,
  desc,
  price,
  next_intake_date,
  available_seats,
}: CourseCardProps) {
  return (
    <div className="transform rounded-lg bg-white p-5 shadow-lg transition duration-300 hover:scale-105">
      <div className="mb-6 h-48">
        <div className="relative h-full w-full">
          <Image
            alt={title}
            className="h-full w-full rounded-lg object-cover"
            height={768}
            src={heading}
            width={768}
          />
        </div>
      </div>
      <div className="space-y-4">
        <Link className="block" href={`/courses/${slug}`}>
          <h5 className="mb-2 font-semibold text-gray-900 text-xl hover:text-gray-700">
            {title}
          </h5>
        </Link>
        <p className="mb-6 font-normal text-gray-600">{desc}</p>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-bold text-gray-800 text-lg">${price}</span>
          {next_intake_date && (
            <div className="text-right">
              <p className="text-gray-600 text-sm">Next Intake:</p>
              <p className="font-semibold text-gray-800">
                {new Date(next_intake_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        {available_seats !== null && (
          <p className="text-gray-600 text-sm">
            Available Seats: {available_seats}
          </p>
        )}
        <Link
          className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
          href={`/courses/${slug}`}
        >
          Read More
        </Link>
      </div>
    </div>
  );
}

export default CourseCard;
