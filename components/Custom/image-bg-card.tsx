'use client';
import Image from 'next/image';
import type React from 'react';

interface ImageBackgroundCardProps {
  images: string[];
  children?: React.ReactNode;
}

export function ImageBackgroundCard({
  images,
  children,
}: ImageBackgroundCardProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-white p-4 dark:bg-gray-900">
      <div className="grid grid-cols-2 gap-4">
        {images.map((src, index) => (
          <div
            key={index}
            className="relative h-32 w-32 transform overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl md:h-40 md:w-40 lg:h-48 lg:w-48"
          >
            <Image
              alt={`Gallery image ${index + 1}`}
              src={src}
              layout="fill"
              objectFit="cover"
              className="rounded-xl border-4 border-white dark:border-gray-700"
            />
          </div>
        ))}
      </div>
      {/* You can place children content here if needed, or remove it if not used */}
      {children && <div className="hidden">{children}</div>}
    </div>
  );
}
export default ImageBackgroundCard;