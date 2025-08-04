/** biome-ignore-all lint/suspicious/noConsole: <error page> */
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-12 text-center dark:bg-gray-900 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-red-600 dark:text-red-500 sm:text-7xl lg:text-8xl">
        Error
      </h1>
      <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200 sm:text-3xl">
        Something went wrong!
      </h2>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="rounded-full bg-red-500 px-8 py-3 text-lg font-semibold text-white shadow-md transition-colors duration-300 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
      >
        Try again
      </Button>
    </div>
  );
}