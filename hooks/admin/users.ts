'use client';
import {useMutation, useQuery, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {
    adminUserCreate,
    adminUserDeleteById,
    adminUserDetailsById,
    adminUserDetailsWithAllById,
    adminUserDetailsWithEnrollmentsById,
    adminUserDetailsWithPaymentsById,
    adminUserDetailsWithProfileById,
    adminUserDetailsWithRefundsById,
    adminUserList,
    adminUserListAll
} from '@/lib/server-actions/admin/users';
import {queryKeys} from '@/lib/query-keys';

export const useAdminUserCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => adminUserCreate(formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.users.all});
            await queryClient.invalidateQueries({queryKey: queryKeys.profiles.all});
        },
    });
};

export const useAdminUserDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminUserDeleteById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.users.all});
        },
    });
};

export const useAdminUserList = (page: number = 1, pageSize: number = 10) => {
    return useQuery({
        queryKey: queryKeys.users.list({page, pageSize}),
        queryFn: async () => await adminUserList(page, pageSize),
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};


export const useAdminUserListAll = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.users.all,
        queryFn: async () => {
            const result = await adminUserListAll();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all users');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminUserDetailsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: async () => {
            const result = await adminUserDetailsById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminUserDetailsWithProfileById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: async () => {
            const result = await adminUserDetailsWithProfileById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user with profile');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminUserDetailsWithEnrollmentsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: async () => {
            const result = await adminUserDetailsWithEnrollmentsById(id);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch user with enrollments'
                );
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminUserDetailsWithPaymentsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: async () => {
            const result = await adminUserDetailsWithPaymentsById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user with payments');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminUserDetailsWithRefundsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: async () => {
            const result = await adminUserDetailsWithRefundsById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user with refunds');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminUserDetailsWithAllById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: async () => {
            const result = await adminUserDetailsWithAllById(id);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch user with all details'
                );
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};