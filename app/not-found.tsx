import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-12 text-center sm:px-6 lg:px-8 dark:bg-gray-900">
            <h1 className="mb-4 font-extrabold text-6xl text-gray-900 tracking-tight sm:text-7xl lg:text-8xl ">
                404
            </h1>
            <h2 className="mb-4 font-bold text-2xl text-gray-800 sm:text-3xl ">
                Page Not Found
            </h2>
            <p className="mb-8 text-gray-600 text-lg sm:text-xl ">
                Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
            <Link href="/">
                <Button className="rounded-full bg-teal-500 px-8 py-3 font-semibold text-lg text-white shadow-md transition-colors duration-300 hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800">
                    Go Home
                </Button>
            </Link>
        </div>
    );
}
