// Export all user deletion related hooks
export * from './user-deletion';
export * from './use-user-deletion-forms';
export * from './use-user-deletion-notifications';

// Re-export commonly used hooks for convenience
export {
    // Core deletion hooks
    useDeleteUser,
    useRestoreUser,
    useDeletedUsers,
    useUserDeletionHistory,
    useCancelScheduledDeletion,
    
    // Form management hooks
    useUserDeletionForm,
    useUserRestorationForm,
    useScheduledDeletionCancellation,
    useBulkDeletionForm,
    useDeletionFilters,
    
    // Notification and monitoring hooks
    useUserDeletionNotifications,
    useScheduledDeletionMonitor,
    useUserDeletionAudit,
    useUserDeletionAnalytics,
    useUserDeletionPermissions,
    
    // Utility hooks
    useCanRestoreUser,
    useUserDeletionStatus,
    useOptimisticUserDeletion,
    usePrefetchUserDeletionHistory,
    
    // Query keys for cache management
    userDeletionKeys,
} from './user-deletion';

export {
    useUserDeletionForm,
    useUserRestorationForm,
    useScheduledDeletionCancellation,
    useBulkDeletionForm,
    useDeletionFilters,
} from './use-user-deletion-forms';

export {
    useUserDeletionNotifications,
    useScheduledDeletionMonitor,
    useUserDeletionAudit,
    useUserDeletionAnalytics,
    useUserDeletionPermissions,
} from './use-user-deletion-notifications';
