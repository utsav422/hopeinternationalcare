'use client';
import type React from 'react';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

export function FeatureCard({ icon: Icon, title, children }: FeatureCardProps) {
  return (
    <div className="p-6 transition duration-300 hover:scale-105">
      <div className="flex flex-col items-center">
        <div className="mb-3 rounded-lg text-gray-900">
          <Icon className="h-10 w-10 text-teal-500" />
        </div>
        <h5 className="mb-2 font-semibold text-gray-900 text-xl">{title}</h5>
        <h6 className="font-normal text-base text-gray-800">{children}</h6>
      </div>
    </div>
  );
}

export default FeatureCard;
