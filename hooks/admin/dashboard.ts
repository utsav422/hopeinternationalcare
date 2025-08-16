'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export const useGetDashboardSummary = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.all,
        queryFn: async () => {

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/dashboard?summary=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard summary');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch dashboard summary');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetTotalUsers = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.totalUsers,
        queryFn: async () => {

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/dashboard?totalUsers=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch total users');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch total users');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetTotalEnrollments = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.totalEnrollment,
        queryFn: async () => {

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/dashboard?totalEnrollments=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch total enrollments');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch total enrollments');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetEnrollmentsByStatus = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.enrollmentByStatus,
        queryFn: async () => {

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/dashboard?enrollmentsByStatus=true`
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
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetTotalIncome = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.totalIncome,
        queryFn: async () => {

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/dashboard?totalIncome=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch total income');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch total income');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetPaymentsByStatus = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.paymentByStatus,
        queryFn: async () => {

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/dashboard?paymentsByStatus=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch payments by status');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payments by status');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
