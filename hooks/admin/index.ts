// Re-export admin user deletion hooks in a curated manner to avoid duplicate identifiers

// Core deletion hooks and utilities
export {
    useDeleteUser,
    useRestoreUser,
    useDeletedUsers,
    useUserDeletionHistory,
    useCancelScheduledDeletion,
    useBulkDeleteUsers,
    useDeletionStatistics,
    useCanRestoreUser,
    useUserDeletionStatus,
    useOptimisticUserDeletion,
    usePrefetchUserDeletionHistory,
    userDeletionKeys,
} from './user-deletion';

// Form management hooks
export {
    useUserDeletionForm,
    useUserRestorationForm,
    useScheduledDeletionCancellation,
    useBulkDeletionForm,
    useDeletionFilters,
} from './use-user-deletion-forms';

// Notification and monitoring hooks
export {
    useUserDeletionNotifications,
    useScheduledDeletionMonitor,
    useUserDeletionAudit,
    useUserDeletionAnalytics,
    useUserDeletionPermissions,
} from './use-user-deletion-notifications';
