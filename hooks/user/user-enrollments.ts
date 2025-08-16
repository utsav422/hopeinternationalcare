'use client';
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import { createEnrollment } from '@/lib/server-actions/user/enrollments';
import { queryKeys } from '../../lib/query-keys';

export const useCreateEnrollment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: FormData) => {
            const result = await createEnrollment(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
        },
    });
};

export const useGetUserEnrollments = () => {
    return useSuspenseQuery({
        queryKey: [queryKeys.enrollments.all],
        queryFn: async () => {


            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/enrollments`);
            if (!response.ok) {
                throw new Error('Failed to fetch enrollments');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollments');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
