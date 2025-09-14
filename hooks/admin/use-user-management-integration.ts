'use client';

import {useCallback, useMemo} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useAdminUserList} from './users';
import {useDeletedUsers, userDeletionKeys} from './user-deletion';
import type {ZodDeletedUsersQueryType} from '@/lib/db/drizzle-zod-schema';

// Hook for integrating soft delete functionality with existing user management
export function useIntegratedUserManagement() {
    const queryClient = useQueryClient();

    // Get active users (existing functionality)
    const {
        data: activeUsersResult,
        isLoading: isLoadingActiveUsers,
        error: activeUsersError
    } = useAdminUserList(1, 50);

    // Get deleted users
    const deletedUsersParams = {
        page: 1,
        pageSize: 50,
        sortBy: 'deleted_at',
        order: 'desc',
    } as ZodDeletedUsersQueryType

    const {
        data: deletedUsersResult,
        isLoading: isLoadingDeletedUsers,
        error: deletedUsersError
    } = useDeletedUsers(deletedUsersParams);

    // Combine and process user data
    const combinedUserData = useMemo(() => {
        const activeUsers = activeUsersResult?.data?.users ?? [];
        const deletedUsers = deletedUsersResult?.users ?? [];

        return {
            activeUsers: activeUsers.map(user => ({
                ...user,
                status: 'active' as const,
                canDelete: true,
                canRestore: false,
            })),
            deletedUsers: deletedUsers.map(user => ({
                ...user,
                status: user.deletion_scheduled_for ? 'scheduled' as const : 'deleted' as const,
                canDelete: false,
                canRestore: true,
            })),
            totalActive: activeUsersResult?.data?.total || 0,
            totalDeleted: deletedUsersResult?.pagination?.total || 0,
        };
    }, [activeUsersResult, deletedUsersResult]);

    // Search across both active and deleted users
    const searchUsers = useCallback((searchTerm: string) => {
        const {activeUsers, deletedUsers} = combinedUserData;
        const allUsers = [...activeUsers, ...deletedUsers];

        if (!searchTerm.trim()) {
            return allUsers;
        }

        const term = searchTerm.toLowerCase();
        return allUsers.filter(user =>
            user.full_name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.phone?.toLowerCase().includes(term)
        );
    }, [combinedUserData]);

    // Get user by ID from either active or deleted users
    const getUserById = useCallback((userId: string) => {
        const {activeUsers, deletedUsers} = combinedUserData;
        const allUsers = [...activeUsers, ...deletedUsers];
        return allUsers.find(user => user.id === userId);
    }, [combinedUserData]);

    // Get users by status
    const getUsersByStatus = useCallback((status: 'active' | 'deleted' | 'scheduled') => {
        const {activeUsers, deletedUsers} = combinedUserData;

        switch (status) {
            case 'active':
                return activeUsers;
            case 'deleted':
                return deletedUsers.filter(user => user.status === 'deleted');
            case 'scheduled':
                return deletedUsers.filter(user => user.status === 'scheduled');
            default:
                return [];
        }
    }, [combinedUserData]);

    // Refresh all user data
    const refreshUserData = useCallback(async () => {
        await queryClient.invalidateQueries({queryKey: ['admin-users']});
        await queryClient.invalidateQueries({queryKey: userDeletionKeys.all});
    }, [queryClient]);

    // Get comprehensive user statistics
    const getUserStatistics = useCallback(() => {
        const {totalActive, totalDeleted, deletedUsers} = combinedUserData;
        const scheduledCount = deletedUsers.filter(user => user.status === 'scheduled').length;
        const immediatelyDeletedCount = totalDeleted - scheduledCount;

        return {
            total: totalActive + totalDeleted,
            active: totalActive,
            deleted: totalDeleted,
            scheduled: scheduledCount,
            immediatelyDeleted: immediatelyDeletedCount,
            deletionRate: totalActive > 0 ? (totalDeleted / (totalActive + totalDeleted)) * 100 : 0,
        };
    }, [combinedUserData]);

    return {
        // Data
        activeUsers: combinedUserData.activeUsers,
        deletedUsers: combinedUserData.deletedUsers,
        allUsers: [...combinedUserData.activeUsers, ...combinedUserData.deletedUsers],

        // Statistics
        statistics: getUserStatistics(),

        // Loading states
        isLoading: isLoadingActiveUsers || isLoadingDeletedUsers,
        isLoadingActiveUsers,
        isLoadingDeletedUsers,

        // Errors
        error: activeUsersError || deletedUsersError,
        activeUsersError,
        deletedUsersError,

        // Utility functions
        searchUsers,
        getUserById,
        getUsersByStatus,
        refreshUserData,
        getUserStatistics,
    };
}

// Hook for managing user status transitions
export function useUserStatusTransitions() {
    const queryClient = useQueryClient();

    // Track user status changes
    const trackStatusChange = useCallback(async (
        userId: string,
        fromStatus: 'active' | 'deleted' | 'scheduled',
        toStatus: 'active' | 'deleted' | 'scheduled',
        reason?: string
    ) => {
        // Log the status change
        console.log(`User ${userId} status changed from ${fromStatus} to ${toStatus}`, {reason});

        // Update relevant caches
        await queryClient.invalidateQueries({queryKey: ['admin-users']});
        await queryClient.invalidateQueries({queryKey: userDeletionKeys.all});

        // Could also trigger analytics updates here
    }, [queryClient]);

    // Get possible transitions for a user
    const getPossibleTransitions = useCallback((currentStatus: 'active' | 'deleted' | 'scheduled') => {
        switch (currentStatus) {
            case 'active':
                return ['deleted', 'scheduled'];
            case 'deleted':
                return ['active']; // restoration
            case 'scheduled':
                return ['active', 'deleted']; // cancel or execute
            default:
                return [];
        }
    }, []);

    // Check if a transition is valid
    const isValidTransition = useCallback((
        fromStatus: 'active' | 'deleted' | 'scheduled',
        toStatus: 'active' | 'deleted' | 'scheduled'
    ) => {
        const possibleTransitions = getPossibleTransitions(fromStatus);
        return possibleTransitions.includes(toStatus);
    }, [getPossibleTransitions]);

    return {
        trackStatusChange,
        getPossibleTransitions,
        isValidTransition,
    };
}

// Hook for user deletion workflow management
export function useUserDeletionWorkflow() {
    // Define workflow steps
    const workflowSteps = [
        {id: 'select', name: 'Select User', description: 'Choose user to delete'},
        {id: 'reason', name: 'Provide Reason', description: 'Enter deletion reason'},
        {id: 'schedule', name: 'Schedule (Optional)', description: 'Set deletion date/time'},
        {id: 'confirm', name: 'Confirm', description: 'Review and confirm deletion'},
        {id: 'execute', name: 'Execute', description: 'Perform deletion'},
        {id: 'notify', name: 'Notify', description: 'Send notifications'},
    ];

    const restorationSteps = [
        {id: 'select', name: 'Select User', description: 'Choose user to restore'},
        {id: 'verify', name: 'Verify Eligibility', description: 'Check restoration limits'},
        {id: 'reason', name: 'Provide Reason', description: 'Enter restoration reason'},
        {id: 'confirm', name: 'Confirm', description: 'Review and confirm restoration'},
        {id: 'execute', name: 'Execute', description: 'Perform restoration'},
        {id: 'notify', name: 'Notify', description: 'Send notifications'},
    ];

    // Get workflow progress
    const getWorkflowProgress = useCallback((currentStep: string, steps: typeof workflowSteps) => {
        const currentIndex = steps.findIndex(step => step.id === currentStep);
        const totalSteps = steps.length;
        const progress = currentIndex >= 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

        return {
            currentStep: currentIndex >= 0 ? steps[currentIndex] : null,
            currentIndex,
            totalSteps,
            progress,
            isComplete: currentIndex === totalSteps - 1,
            nextStep: currentIndex < totalSteps - 1 ? steps[currentIndex + 1] : null,
            previousStep: currentIndex > 0 ? steps[currentIndex - 1] : null,
        };
    }, []);

    return {
        workflowSteps,
        restorationSteps,
        getWorkflowProgress,
        getDeletionProgress: (currentStep: string) => getWorkflowProgress(currentStep, workflowSteps),
        getRestorationProgress: (currentStep: string) => getWorkflowProgress(currentStep, restorationSteps),
    };
}

// Hook for user deletion compliance and validation
export function useUserDeletionCompliance() {
    // Validation rules
    const validationRules = {
        minReasonLength: 10,
        maxReasonLength: 500,
        maxRestorations: 3,
        maxScheduleDays: 30,
        requiredPermissions: ['admin', 'super_admin'],
    };

    // Validate deletion request
    const validateDeletionRequest = useCallback((request: {
        userId: string;
        reason: string;
        scheduledDate?: string;
        adminRole: string;
    }) => {
        const errors: string[] = [];

        // Check permissions
        if (!validationRules.requiredPermissions.includes(request.adminRole)) {
            errors.push('Insufficient permissions for user deletion');
        }

        // Check reason length
        if (request.reason.length < validationRules.minReasonLength) {
            errors.push(`Deletion reason must be at least ${validationRules.minReasonLength} characters`);
        }

        if (request.reason.length > validationRules.maxReasonLength) {
            errors.push(`Deletion reason cannot exceed ${validationRules.maxReasonLength} characters`);
        }

        // Check scheduled date
        if (request.scheduledDate) {
            const scheduledDate = new Date(request.scheduledDate);
            const now = new Date();
            const maxDate = new Date(now.getTime() + validationRules.maxScheduleDays * 24 * 60 * 60 * 1000);

            if (scheduledDate <= now) {
                errors.push('Scheduled deletion date must be in the future');
            }

            if (scheduledDate > maxDate) {
                errors.push(`Scheduled deletion cannot be more than ${validationRules.maxScheduleDays} days in the future`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }, [validationRules]);

    // Validate restoration request
    const validateRestorationRequest = useCallback((request: {
        userId: string;
        reason: string;
        deletionCount: number;
        adminRole: string;
    }) => {
        const errors: string[] = [];

        // Check permissions (restoration requires super admin)
        if (request.adminRole !== 'super_admin') {
            errors.push('Super admin permissions required for user restoration');
        }

        // Check restoration limit
        if (request.deletionCount >= validationRules.maxRestorations) {
            errors.push(`User has reached the maximum restoration limit of ${validationRules.maxRestorations}`);
        }

        // Check reason length
        if (request.reason.length < 5) {
            errors.push('Restoration reason must be at least 5 characters');
        }

        if (request.reason.length > 300) {
            errors.push('Restoration reason cannot exceed 300 characters');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }, [validationRules]);

    return {
        validationRules,
        validateDeletionRequest,
        validateRestorationRequest,
    };
}
