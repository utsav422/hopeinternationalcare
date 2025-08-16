'use client';

import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import type { TypeEnrollmentStatus } from '@/lib/db/schema/enums';
import { queryKeys } from '@/lib/query-keys';
import {
    adminDeleteEnrollment,
    adminUpdateEnrollmentStatus,
    adminUpsertEnrollment,
} from '@/lib/server-actions/admin/enrollments';

export const useGetEnrollments = (params: {
    page?: number;
    pageSize?: number;
    filters?: ColumnFiltersState;
}) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.list(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page?.toString() || '1',
                pageSize: params.pageSize?.toString() || '10',
                filters: JSON.stringify(params.filters || []),
            });


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/enrollments?${searchParams}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch enrollments');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollments');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetEnrollmentById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detail(id),
        queryFn: async () => {


            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/enrollments?id=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch enrollment');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollment');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetEnrollmentWithDetails = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detail(id),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/enrollments?id=${id}&withDetails=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch enrollment details');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollment details');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetEnrollmentsByUserId = (userId: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detailByUserId(userId),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/enrollments?userId=${userId}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch enrollments');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch enrollments');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetEnrollmentWithPayment = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.detailByPaymentId(id),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/enrollments?id=${id}&withPayment=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch enrollment with payment');
            }
            const result = await response.json();
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

export const useGetAllEnrollments = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.all,
        queryFn: async () => {

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/enrollments?getAll=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch all enrollments');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all enrollments');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetAllEnrollmentsByStatus = (status: TypeEnrollmentStatus) => {
    return useSuspenseQuery({
        queryKey: queryKeys.enrollments.list({ status }),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/enrollments?getAll=true&status=${status}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch enrollments by status');
            }
            const result = await response.json();
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

export const useUpsertEnrollment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ZodEnrollmentInsertType) => adminUpsertEnrollment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
        },
    });
};

export const useUpdateEnrollmentStatus = () => {
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
        }) => adminUpdateEnrollmentStatus(id, status, cancelled_reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
        },
    });
};

export const useDeleteEnrollment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminDeleteEnrollment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
        },
    });
};
