'use client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import SignUpCard from './singup-card';
import { useSearchParams } from 'next/navigation';

export default function AdminSignUpClient() {
    const searchParams = useSearchParams()
    const error = searchParams?.getAll('error')

    // Display error message from URL parameter as toast
    useEffect(() => {
        if (error && error.length > 0) {
            const errorMessage = Array.isArray(error)
                ? error[0]
                : error;
            toast.error(decodeURIComponent(errorMessage));
        }
    }, [error]);

    return <SignUpCard />;
}