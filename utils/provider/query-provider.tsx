'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import type { ReactNode } from 'react';
import { getQueryClient } from '../get-query-client';

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <ReactQueryStreamedHydration>
                {children}
            </ReactQueryStreamedHydration>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
