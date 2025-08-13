'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorComponent({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // In a real application, you would log the error to an error reporting service
        // console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-12 text-center sm:px-6 lg:px-8 dark:bg-gray-900">
            <h1 className="mb-4 font-extrabold text-6xl text-red-600 tracking-tight sm:text-7xl lg:text-8xl dark:text-red-500">
                Error
            </h1>
            <h2 className="mb-4 font-bold text-2xl text-gray-800 sm:text-3xl ">
                Something went wrong!
            </h2>
            <p className="mb-8 text-gray-600 text-lg sm:text-xl ">
                {error.message || 'An unexpected error occurred.'}
            </p>
            <Button
                className="rounded-full bg-red-500 px-8 py-3 font-semibold text-lg text-white shadow-md transition-colors duration-300 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </Button>
        </div>
    );
}
