
'use client'
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary, type ErrorBoundaryProps } from 'react-error-boundary';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface QueryErrorWrapperProps {
    children: React.ReactNode;
    errorFallback?: ErrorBoundaryProps['FallbackComponent'];
    onReset?: () => void;
}

function DefaultErrorFallback({
    error,
    resetErrorBoundary,
}: {
    error: Error;
    resetErrorBoundary: () => void;
}) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="font-medium text-red-800">Something went wrong</h3>
            <p className="mt-1 text-red-600 text-sm">{error.message}</p>
            <div className="mt-3 flex gap-2">
                <Button
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    onClick={resetErrorBoundary}
                >
                    Try Again
                </Button>
                <Button
                    className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                    onClick={() => toast.dismiss()}
                >
                    Dismiss
                </Button>
            </div>
        </div>
    );
}

export function QueryErrorWrapper({
    children,
    errorFallback: FallbackComponent = DefaultErrorFallback,
    onReset,
}: QueryErrorWrapperProps) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    FallbackComponent={FallbackComponent}
                    onReset={() => {
                        reset();
                        onReset?.();
                    }}
                >
                    {children}
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
}
