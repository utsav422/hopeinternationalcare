'use client';
import SetupPasswordForm from './_components/setup-password-form';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SetupPassword() {
    const searchParams = useSearchParams()
    const error = searchParams.getAll('error')
    // Display error message from URL parameter as toast
    useEffect(() => {
        if (error && error.length > 0) {
            const errorMessage = Array.isArray(error)
                ? error[0]
                : error;
            toast.error(decodeURIComponent(errorMessage));
        }
    }, [error]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100 p-4">
            <SetupPasswordForm />
        </div>
    );
}
