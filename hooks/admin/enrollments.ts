'use client';

import {useMutation, useQueryClient, useSuspenseQuery,} from '@tanstack/react-query';
import type {ColumnFiltersState} from '@tanstack/react-table';
import type {ZodEnrollmentInsertType} from '@/lib/db/drizzle-zod-schema/enrollments';
import type {TypeEnrollmentStatus} from '@/lib/db/schema/enums';
import {queryKeys} from '@/lib/query-keys';
import {
    adminEnrollmentDeleteById,
    adminEnrollmentDetailsById,
    adminEnrollmentDetailsWithJoinsById,
    adminEnrollmentDetailsWithPaymentById,
    adminEnrollmentList,
    adminEnrollmentListAll,
    adminEnrollmentListAllByStatus,
    adminEnrollmentListByUserId,
    adminEnrollmentUpdateStatusById,
    adminEnrollmentUpsert,
} from '@/lib/server-actions/admin/enrollments';

export const useAdminEnrollmentList = (params: {
    page?: number;
    pageSize?: number;
    filters?: ColumnFiltersState;
}) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.list(params),
        queryFn: async () => {
            const result = await adminEnrollmentList(params);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollments');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentDetailsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detail(id),
        queryFn: async () => {
            const result = await adminEnrollmentDetailsById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollment');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentDetailsWithAllById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detail(id),
        queryFn: async () => {
            const result = await adminEnrollmentDetailsWithJoinsById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollment details');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentListByUserId = (userId: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detailByUserId(userId),
        queryFn: async () => {
            const result = await adminEnrollmentListByUserId(userId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollments');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentDetailsWithPaymentById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detailByPaymentId(id),
        queryFn: async () => {
            const result = await adminEnrollmentDetailsWithPaymentById(id);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch enrollment with payment'
                );
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentListAll = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.all,
        queryFn: async () => {
            const result = await adminEnrollmentListAll();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all enrollments');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentListAllByStatus = (status: TypeEnrollmentStatus) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.list({status}),
        queryFn: async () => {
            const result = await adminEnrollmentListAllByStatus(status);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch enrollments by status'
                );
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminEnrollmentUpsert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ZodEnrollmentInsertType) => adminEnrollmentUpsert(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.enrollments.all});
        },
    });
};

export const useAdminEnrollmentUpdateStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         id,
                         status,
                         cancelled_reason,
                     }: {
            id: string;
            status: TypeEnrollmentStatus;
            cancelled_reason?: string;
        }) => adminEnrollmentUpdateStatusById(id, status, cancelled_reason),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.enrollments.all});
        },
    });
};

export const useAdminEnrollmentDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminEnrollmentDeleteById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.enrollments.all});
        },
    });
};
