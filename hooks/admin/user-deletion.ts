'use client';

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {
    cancelScheduledDeletionAction,
    getDeletedUsersAction,
    getUserDeletionHistoryAction,
    restoreUserAction,
    softDeleteUserAction
} from '@/lib/server-actions/admin/user-deletion';
import type {ZodDeletedUsersQueryType, ZodUserDeletionType, ZodUserRestorationType} from '@/lib/db/drizzle-zod-schema';

// Query keys for consistent cache management
export const userDeletionKeys = {
    all: ['user-deletion'] as const,
    deletedUsers: () => [...userDeletionKeys.all, 'deleted-users'] as const,
    deletedUsersList: (params: ZodDeletedUsersQueryType) =>
        [...userDeletionKeys.deletedUsers(), params] as const,
    history: () => [...userDeletionKeys.all, 'history'] as const,
    userHistory: (userId: string) =>
        [...userDeletionKeys.history(), userId] as const,
};

// Hook for deleting a user (soft delete)
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ZodUserDeletionType) => {
            const formData = new FormData();
            formData.append('user_id', data.user_id);
            formData.append('deletion_reason', data.deletion_reason);
            if (data.scheduled_deletion_date) {
                formData.append('scheduled_deletion_date', data.scheduled_deletion_date);
            }
            formData.append('send_email_notification', data.send_email_notification?.toString() || 'true');

            const result = await softDeleteUserAction(formData);

            if (!result.success) {
                throw new Error(result.message || 'Failed to delete user');
            }

            return result;
        },
        onSuccess: async (data) => {
            // Invalidate and refetch relevant queries
            await queryClient.invalidateQueries({queryKey: userDeletionKeys.all});
            await queryClient.invalidateQueries({queryKey: ['admin-users']});

            toast.success(data.message || 'User deleted successfully');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to delete user');
        },
    });
}

// Hook for restoring a user
export function useRestoreUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ZodUserRestorationType) => {
            const formData = new FormData();
            formData.append('user_id', data.user_id);
            formData.append('restoration_reason', data.restoration_reason);

            const result = await restoreUserAction(formData);

            if (!result.success) {
                throw new Error(result.message || 'Failed to restore user');
            }

            return result;
        },
        onSuccess: async (data) => {
            // Invalidate and refetch relevant queries
            await queryClient.invalidateQueries({queryKey: userDeletionKeys.all});
            await queryClient.invalidateQueries({queryKey: ['admin-users']});

            toast.success(data.message || 'User restored successfully');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to restore user');
        },
    });
}

// Hook for fetching deleted users with pagination and filters
export function useDeletedUsers(params: ZodDeletedUsersQueryType) {
    return useQuery({
        queryKey: userDeletionKeys.deletedUsersList(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams();

            // Add all parameters to search params
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value.toString() !== '') {
                    searchParams.append(key, value.toString());
                }
            });

            const result = await getDeletedUsersAction(searchParams);

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch deleted users');
            }

            return result.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Hook for fetching user deletion history
export function useUserDeletionHistory(userId: string, enabled = true) {
    return useQuery({
        queryKey: userDeletionKeys.userHistory(userId),
        queryFn: async () => {
            const result = await getUserDeletionHistoryAction(userId);

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch deletion history');
            }

            return result.data;
        },
        enabled: enabled && !!userId,
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Hook for canceling scheduled deletion
export function useCancelScheduledDeletion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const formData = new FormData();
            formData.append('user_id', userId);

            const result = await cancelScheduledDeletionAction(formData);

            if (!result.success) {
                throw new Error(result.message || 'Failed to cancel scheduled deletion');
            }

            return result;
        },
        onSuccess: async (data) => {
            // Invalidate and refetch relevant queries
            await queryClient.invalidateQueries({queryKey: userDeletionKeys.all});
            await queryClient.invalidateQueries({queryKey: ['admin-users']});

            toast.success(data.message || 'Scheduled deletion cancelled successfully');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to cancel scheduled deletion');
        },
    });
}

// Hook for bulk operations (future enhancement)
export function useBulkDeleteUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { userIds: string[]; deletion_reason: string; send_email_notification?: boolean }) => {
            // Process deletions in parallel
            const promises = data.userIds.map(async (userId) => {
                const formData = new FormData();
                formData.append('user_id', userId);
                formData.append('deletion_reason', data.deletion_reason);
                formData.append('send_email_notification', data.send_email_notification?.toString() || 'true');

                return softDeleteUserAction(formData);
            });

            const results = await Promise.allSettled(promises);

            const successful = results.filter(result =>
                result.status === 'fulfilled' && result.value.success
            ).length;

            const failed = results.length - successful;

            if (failed > 0) {
                throw new Error(`${failed} out of ${results.length} deletions failed`);
            }

            return {successful, failed, total: results.length};
        },
        onSuccess: async (data) => {
            // Invalidate and refetch relevant queries
            await queryClient.invalidateQueries({queryKey: userDeletionKeys.all});
            await queryClient.invalidateQueries({queryKey: ['admin-users']});

            toast.success(`Successfully deleted ${data.successful} users`);
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Bulk deletion failed');
        },
    });
}

// Hook for getting deletion statistics
export function useDeletionStatistics() {
    return useQuery({
        queryKey: [...userDeletionKeys.all, 'statistics'],
        queryFn: async () => {
            // Get basic statistics from deleted users
            const result = await getDeletedUsersAction(new URLSearchParams({page: '1', pageSize: '1'}));

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch statistics');
            }

            return {
                totalDeleted: result.data?.pagination.total,
                // Additional statistics can be added here
            };
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Utility hook for prefetching user deletion history
export function usePrefetchUserDeletionHistory() {
    const queryClient = useQueryClient();

    return (userId: string) => {
        queryClient.prefetchQuery({
            queryKey: userDeletionKeys.userHistory(userId),
            queryFn: async () => {
                const result = await getUserDeletionHistoryAction(userId);

                if (!result.success) {
                    throw new Error(result.message || 'Failed to fetch deletion history');
                }

                return result.data;
            },
            staleTime: 60 * 1000, // 1 minute
        });
    };
}

// Hook for checking if a user can be restored (based on restoration limits)
export function useCanRestoreUser(userId: string, deletionCount: number) {
    const maxRestorations = parseInt(process.env.NEXT_PUBLIC_MAX_USER_RESTORATIONS || '3');

    return {
        canRestore: deletionCount < maxRestorations,
        remainingRestorations: Math.max(0, maxRestorations - deletionCount),
        maxRestorations,
        isAtLimit: deletionCount >= maxRestorations,
    };
}

// Hook for real-time deletion status updates
export function useUserDeletionStatus(userId: string) {
    return useQuery({
        queryKey: [...userDeletionKeys.all, 'status', userId],
        queryFn: async () => {
            // This would typically fetch the current status from the server
            // For now, we'll use the deleted users query to get status
            const result = await getDeletedUsersAction(new URLSearchParams({
                page: '1',
                pageSize: '1',
                search: userId
            }));

            if (!result.success) {
                return {isDeleted: false, isScheduled: false};
            }

            const user = result.data?.users.find(u => u.id === userId);
            if (!user) {
                return {isDeleted: false, isScheduled: false};
            }

            return {
                isDeleted: !!user.deleted_at,
                isScheduled: !!user.deletion_scheduled_for,
                deletionDate: user.deleted_at,
                scheduledDate: user.deletion_scheduled_for,
                deletionReason: user.deletion_reason,
            };
        },
        enabled: !!userId,
        refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
        staleTime: 15 * 1000, // 15 seconds
    });
}

// Hook for optimistic updates
export function useOptimisticUserDeletion() {
    const queryClient = useQueryClient();

    const optimisticDelete = (userId: string, userData: any) => {
        // Optimistically update the users list
        queryClient.setQueryData(['admin-users'], (oldData: any) => {
            if (!oldData) return oldData;

            return {
                ...oldData,
                users: oldData.users?.filter((user: any) => user.id !== userId) || [],
                total: Math.max(0, (oldData.total || 0) - 1),
            };
        });

        // Add to deleted users list optimistically
        queryClient.setQueryData(userDeletionKeys.deletedUsers(), (oldData: any) => {
            if (!oldData) return oldData;

            const deletedUser = {
                ...userData,
                deleted_at: new Date().toISOString(),
                deletion_count: (userData.deletion_count || 0) + 1,
            };

            return {
                ...oldData,
                users: [deletedUser, ...(oldData.users || [])],
                total: (oldData.total || 0) + 1,
            };
        });
    };

    const optimisticRestore = (userId: string) => {
        // Remove from deleted users list optimistically
        queryClient.setQueryData(userDeletionKeys.deletedUsers(), (oldData: any) => {
            if (!oldData) return oldData;

            return {
                ...oldData,
                users: oldData.users?.filter((user: any) => user.id !== userId) || [],
                total: Math.max(0, (oldData.total || 0) - 1),
            };
        });

        // This would typically add back to the active users list
        // Implementation depends on the structure of the active users query
    };

    const rollbackOptimisticUpdate = async () => {
        // Invalidate all related queries to refetch fresh data
        await queryClient.invalidateQueries({queryKey: userDeletionKeys.all});
        await queryClient.invalidateQueries({queryKey: ['admin-users']});
    };

    return {
        optimisticDelete,
        optimisticRestore,
        rollbackOptimisticUpdate,
    };
}
