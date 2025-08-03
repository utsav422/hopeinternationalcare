'use client';
import Image from 'next/image';
import type React from 'react';

interface ImageBackgroundCardProps {
  image: string;
  children: React.ReactNode;
}

export function ImageBackgroundCard({
  image: _,
  children: __,
}: ImageBackgroundCardProps) {
  return (
    <div className="grid h-full place-items-center rounded-xl bg-white">
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-12 transform overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl lg:mb-0">
          <Image
            alt=""
            className="h-full w-full border-4 border-white object-cover"
            height={'100'}
            src="/image/2.jpeg"
            width={'100'}
            // style={{
            //   borderRadius: '8px',
            //   borderWidth: '10px',
            //   borderColor: 'white',
            // }}
          />
        </div>
        <div className="mb-12 transform overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl lg:mb-0">
          <Image
            alt=""
            className="h-full w-full border-4 border-white object-cover"
            height={'100'}
            src="/image/3.jpeg"
            style={{
              borderRadius: '8px',
              borderWidth: '10px',
              borderColor: 'white',
            }}
            width={'100'}
          />
        </div>
        <div className="mb-12 transform overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl lg:mb-0">
          <Image
            alt=""
            className="h-full w-full border-4 border-white object-cover"
            height={'100'}
            src="/image/4.jpeg"
            style={{
              borderRadius: '8px',
              borderWidth: '10px',
              borderColor: 'white',
            }}
            width={'100'}
          />
        </div>
        <div className="mb-12 transform overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl lg:mb-0">
          <Image
            alt=""
            className="h-full w-full border-4 border-white object-cover"
            height={'100'}
            src="/image/5.jpeg"
            style={{
              borderRadius: '8px',
              borderWidth: '10px',
              borderColor: 'white',
            }}
            width={'100'}
          />
        </div>

        <div className="mb-12 transform overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl lg:mb-0">
          <Image
            alt=""
            className="h-full w-full border-4 border-white object-cover"
            height={'100'}
            src="/image/group2.jpeg"
            style={{
              borderRadius: '8px',
              borderWidth: '10px',
              borderColor: 'white',
            }}
            width={'100'}
          />
        </div>
        <div className="mb-12 transform overflow-hidden rounded-xl shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl lg:mb-0">
          <Image
            alt=""
            className="h-full w-full border-4 border-white object-cover"
            height={'100'}
            src="/image/student2.jpeg"
            style={{
              borderRadius: '8px',
              borderWidth: '10px',
              borderColor: 'white',
            }}
            width={'100'}
          />
        </div>
      </div>
    </div>
  );
}
export default ImageBackgroundCard;
