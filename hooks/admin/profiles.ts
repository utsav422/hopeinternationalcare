'use client';

import {useMutation, useQueryClient, useSuspenseQuery,} from '@tanstack/react-query';
import type {ZodSelectProfileType} from '@/lib/db/drizzle-zod-schema/profiles';
import {queryKeys} from '@/lib/query-keys';
import {
    adminProfileDetailsById,
    adminProfileList,
    adminProfileListAll,
    adminProfileUpdateById
} from '@/lib/server-actions/admin/profiles';

export const useAdminProfileList = (params: {
    page?: number;
    pageSize?: number;
    search?: string;
}) => {
    return useSuspenseQuery({
        queryKey: queryKeys.profiles.list(params),
        queryFn: async () => {
            const result = await adminProfileList(params);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch profiles');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminProfileListAll = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.profiles.all,
        queryFn: async () => {
            const result = await adminProfileListAll();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all profiles');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminProfileDetailsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.profiles.detail(id),
        queryFn: async () => {
            const result = await adminProfileDetailsById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch profile');
            }
            return result.data;
        },
    });
};

export const useAdminProfileUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         id,
                         updates,
                     }: {
            id: string;
            updates: Partial<ZodSelectProfileType>;
        }) => adminProfileUpdateById(id, updates),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.profiles.all});
        },
    });
};
