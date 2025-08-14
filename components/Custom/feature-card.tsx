'use client';
import type React from 'react';

interface FeatureCardProps {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}

export function FeatureCard({ icon: Icon, title, children }: FeatureCardProps) {
    return (
        <div className="p-6 transition duration-300 hover:scale-105 dark:rounded-lg dark:bg-gray-800 dark:shadow-xl">
            <div className="flex flex-col items-center">
                <div className="mb-3 rounded-lg text-gray-900 dark:text-teal-400">
                    <Icon className="h-10 w-10 text-teal-500" />
                </div>
                <h5 className="mb-2 font-semibold text-gray-900 text-xl dark:text-white">
                    {title}
                </h5>
                <h6 className="font-normal text-base text-gray-800 dark:text-gray-300">
                    {children}
                </h6>
            </div>
        </div>
    );
}

export default FeatureCard;
