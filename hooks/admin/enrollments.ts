'use client';

import {
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type {
    EnrollmentListItem,
    EnrollmentWithDetails,
    EnrollmentQueryParams,
    EnrollmentStatusUpdate,
    EnrollmentCreateData,
    EnrollmentBulkStatusUpdate,
    TypeEnrollmentStatus,
} from '@/lib/types/enrollments';
import { queryKeys } from '@/lib/query-keys';
import {
    adminEnrollmentList,
    adminEnrollmentDetails,
    adminEnrollmentCreate,
    adminEnrollmentUpdate,
    adminEnrollmentUpdateStatus,
    adminEnrollmentBulkStatusUpdate,
    adminEnrollmentDelete,
    cachedAdminEnrollmentList,
    adminEnrollmentUpsert,
} from '@/lib/server-actions/admin/enrollments-optimized';

// Standardized query hooks

export const useAdminEnrollmentList = (params: EnrollmentQueryParams) => {
    return useQuery({
        queryKey: queryKeys.enrollments.list(params),
        queryFn: async () => {
            const result = await adminEnrollmentList(params);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollments');
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentDetails = (id: string) => {
    return useQuery({
        queryKey: queryKeys.enrollments.detail(id),
        queryFn: async () => {
            const result = await adminEnrollmentDetails(id);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch enrollment details'
                );
            }
            return result;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentListByStatus = (
    status: TypeEnrollmentStatus
) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.list({ status }),
        queryFn: async () => {
            const result = await cachedAdminEnrollmentList({ status });
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch enrollments by status'
                );
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentListByUserId = (userId: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detailByUserId(userId),
        queryFn: async () => {
            const result = await cachedAdminEnrollmentList({ userId });
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch user enrollments'
                );
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

//
export const useAdminEnrollmentUpsert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<EnrollmentCreateData & { id?: string }>) =>
            adminEnrollmentUpsert(data),
        onSuccess: async result => {
            if (result.success) {
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.enrollments.all,
                });
                if (result.data?.enrollment.id) {
                    await queryClient.invalidateQueries({
                        queryKey: queryKeys.enrollments.detail(
                            result.data.enrollment.id
                        ),
                    });
                }
            }
        },
    });
};

// Standardized mutation hooks

export const useAdminEnrollmentCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EnrollmentCreateData) => adminEnrollmentCreate(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.enrollments.all,
            });
        },
    });
};

export const useAdminEnrollmentUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Partial<EnrollmentCreateData>;
        }) => adminEnrollmentUpdate(id, data),
        onSuccess: async result => {
            if (result.success) {
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.enrollments.all,
                });
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.enrollments.detail(
                        result.data?.enrollment.id || ''
                    ),
                });
            }
        },
    });
};

export const useAdminEnrollmentUpdateStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (update: EnrollmentStatusUpdate) =>
            adminEnrollmentUpdateStatus(update),
        onSuccess: async result => {
            if (result.success) {
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.enrollments.all,
                });
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.enrollments.detail(
                        result.data?.enrollment.id || ''
                    ),
                });
            }
        },
    });
};

export const useAdminEnrollmentBulkStatusUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: EnrollmentBulkStatusUpdate) =>
            adminEnrollmentBulkStatusUpdate(updates),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.enrollments.all,
            });
        },
    });
};

export const useAdminEnrollmentDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminEnrollmentDelete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.enrollments.all,
            });
        },
    });
};
