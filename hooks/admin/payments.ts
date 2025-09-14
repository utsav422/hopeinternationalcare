'use client';

import {useMutation, useQueryClient, useSuspenseQuery,} from '@tanstack/react-query';
import type {TypePaymentStatus} from '@/lib/db/schema/enums';
import {queryKeys} from '@/lib/query-keys';
import {
    adminPaymentDeleteById,
    adminPaymentDetailsByEnrollmentId,
    adminPaymentDetailsById,
    adminPaymentDetailsWithRelationsById,
    adminPaymentList,
    adminPaymentUpdateStatusById,
    adminPaymentUpsert,
} from '@/lib/server-actions/admin/payments';
import type {ZodInsertPaymentType} from '@/lib/db/drizzle-zod-schema/payments';

export const useAdminPaymentList = (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: TypePaymentStatus;
}) => {

    return useSuspenseQuery({
        queryKey: queryKeys.payments.list(params),
        queryFn: async () => {
            const result = await adminPaymentList(params);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payments');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminPaymentDetailsByEnrollmentId = (enrollmentId: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.payments.detailByEnrollment(enrollmentId),
        queryFn: async () => {
            const result = await adminPaymentDetailsByEnrollmentId(enrollmentId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payment details');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminPaymentDetailsById = (paymentId: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.payments.detail(paymentId),
        queryFn: async () => {
            const result = await adminPaymentDetailsById(paymentId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payment details');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminPaymentDetailsWithAllById = (paymentId: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.payments.detail(paymentId),
        queryFn: async () => {
            const result = await adminPaymentDetailsWithRelationsById(paymentId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payment details');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminPaymentUpsert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ZodInsertPaymentType) => adminPaymentUpsert(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.payments.all});
        },
    });
};

export const useAdminPaymentUpdateStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
                         id,
                         status,
                         remarks,
                     }: {
            id: string;
            status: TypePaymentStatus;
            remarks?: string;
        }) => adminPaymentUpdateStatusById(id, status, remarks),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.payments.all});
        },
    });
};

export const useAdminPaymentDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminPaymentDeleteById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.payments.all});
        },
    });
};
