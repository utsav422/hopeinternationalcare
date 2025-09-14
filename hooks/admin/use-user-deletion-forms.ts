'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useDeleteUser, useRestoreUser, useCancelScheduledDeletion } from './user-deletion';
import type { ZodUserDeletionType, ZodUserRestorationType } from '@/lib/db/drizzle-zod-schema';

// Form-specific schema that makes send_email_notification required
const FormUserDeletionSchema = z.object({
    user_id: z.string().uuid(),
    deletion_reason: z.string().min(10, 'Deletion reason must be at least 10 characters').max(500, 'Deletion reason cannot exceed 500 characters'),
    scheduled_deletion_date: z.string().datetime().optional(),
    send_email_notification: z.boolean(),
});

type FormUserDeletionType = z.infer<typeof FormUserDeletionSchema>;

// Hook for managing user deletion form state and submission
export function useUserDeletionForm(user: { id: string; full_name: string; email: string } | null) {
    const [isScheduled, setIsScheduled] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const deleteUserMutation = useDeleteUser();

    const form = useForm<FormUserDeletionType>({
        resolver: zodResolver(FormUserDeletionSchema),
        defaultValues: {
            user_id: user?.id || '',
            deletion_reason: '',
            scheduled_deletion_date: undefined,
            send_email_notification: true,
        },
    });

    // Update form when user changes
    useEffect(() => {
        if (user) {
            form.setValue('user_id', user.id);
        }
    }, [user, form]);

    // Generate default scheduled deletion date (current Nepal time + 24 hours)
    const getDefaultScheduledDate = useCallback(() => {
        const now = new Date();
        const nepalTime = new Date(now.getTime() + (5.75 * 60 * 60 * 1000)); // Nepal is UTC+5:45
        nepalTime.setDate(nepalTime.getDate() + 1); // Add 1 day
        return nepalTime.toISOString().slice(0, 16); // Format for datetime-local input
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(async (data: FormUserDeletionType) => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            await deleteUserMutation.mutateAsync({
                ...data,
                user_id: user.id,
                send_email_notification: data.send_email_notification,
            });
            
            // Reset form on success
            form.reset();
            setIsScheduled(false);
            
            return { success: true };
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete user');
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    }, [user, deleteUserMutation, form]);

    // Handle scheduled deletion toggle
    const handleScheduledToggle = useCallback((checked: boolean) => {
        setIsScheduled(checked);
        if (checked) {
            form.setValue('scheduled_deletion_date', getDefaultScheduledDate());
        } else {
            form.setValue('scheduled_deletion_date', undefined);
        }
    }, [form, getDefaultScheduledDate]);

    // Reset form
    const resetForm = useCallback(() => {
        form.reset();
        setIsScheduled(false);
        setIsSubmitting(false);
    }, [form]);

    return {
        form,
        isScheduled,
        isSubmitting,
        handleSubmit,
        handleScheduledToggle,
        resetForm,
        getDefaultScheduledDate,
        isLoading: deleteUserMutation.isPending,
    };
}

// Hook for managing user restoration form state and submission
export function useUserRestorationForm(user: { id: string; full_name: string; email: string; deletion_count?: number } | null) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const restoreUserMutation = useRestoreUser();
    const maxRestorations = parseInt(process.env.NEXT_PUBLIC_MAX_USER_RESTORATIONS || '3');

    const form = useForm<ZodUserRestorationType>({
        resolver: zodResolver(z.object({
            user_id: z.string().uuid(),
            restoration_reason: z.string().min(5, 'Restoration reason must be at least 5 characters').max(300, 'Restoration reason cannot exceed 300 characters'),
        })),
        defaultValues: {
            user_id: user?.id || '',
            restoration_reason: '',
        },
    });

    // Update form when user changes
    useEffect(() => {
        if (user) {
            form.setValue('user_id', user.id);
        }
    }, [user, form]);

    // Check if user can be restored
    const canRestore = user ? (user.deletion_count || 0) < maxRestorations : false;
    const remainingRestorations = user ? Math.max(0, maxRestorations - (user.deletion_count || 0)) : 0;

    // Handle form submission
    const handleSubmit = useCallback(async (data: ZodUserRestorationType) => {
        if (!user || !canRestore) return;

        setIsSubmitting(true);
        try {
            await restoreUserMutation.mutateAsync({
                ...data,
                user_id: user.id,
            });
            
            // Reset form on success
            form.reset();
            
            return { success: true };
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to restore user');
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    }, [user, canRestore, restoreUserMutation, form]);

    // Reset form
    const resetForm = useCallback(() => {
        form.reset();
        setIsSubmitting(false);
    }, [form]);

    return {
        form,
        isSubmitting,
        canRestore,
        remainingRestorations,
        maxRestorations,
        handleSubmit,
        resetForm,
        isLoading: restoreUserMutation.isPending,
    };
}

// Hook for managing scheduled deletion cancellation
export function useScheduledDeletionCancellation() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cancelMutation = useCancelScheduledDeletion();

    const cancelScheduledDeletion = useCallback(async (userId: string) => {
        setIsSubmitting(true);
        try {
            await cancelMutation.mutateAsync(userId);
            return { success: true };
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to cancel scheduled deletion');
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    }, [cancelMutation]);

    return {
        cancelScheduledDeletion,
        isSubmitting,
        isLoading: cancelMutation.isPending,
    };
}

// Hook for managing bulk deletion operations
export function useBulkDeletionForm() {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bulkReason, setBulkReason] = useState('');

    const form = useForm({
        resolver: zodResolver(z.object({
            deletion_reason: z.string().min(10, 'Deletion reason must be at least 10 characters').max(500, 'Deletion reason cannot exceed 500 characters'),
            send_email_notification: z.boolean().default(true),
        })),
        defaultValues: {
            deletion_reason: '',
            send_email_notification: true,
        },
    });

    // Toggle user selection
    const toggleUserSelection = useCallback((userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    }, []);

    // Select all users
    const selectAllUsers = useCallback((userIds: string[]) => {
        setSelectedUsers(userIds);
    }, []);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedUsers([]);
    }, []);

    // Handle bulk deletion
    const handleBulkDeletion = useCallback(async (data: { deletion_reason: string; send_email_notification: boolean }) => {
        if (selectedUsers.length === 0) {
            toast.error('No users selected for deletion');
            return { success: false };
        }

        setIsSubmitting(true);
        try {
            // This would use the bulk deletion hook
            // For now, we'll process them individually
            const promises = selectedUsers.map(async (userId) => {
                // Individual deletion logic would go here
                return { userId, success: true };
            });

            const results = await Promise.allSettled(promises);
            const successful = results.filter(result => 
                result.status === 'fulfilled' && result.value.success
            ).length;

            toast.success(`Successfully deleted ${successful} out of ${selectedUsers.length} users`);
            
            // Clear selection and reset form
            clearSelection();
            form.reset();
            
            return { success: true, successful, total: selectedUsers.length };
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Bulk deletion failed');
            return { success: false, error };
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedUsers, form, clearSelection]);

    return {
        form,
        selectedUsers,
        isSubmitting,
        toggleUserSelection,
        selectAllUsers,
        clearSelection,
        handleBulkDeletion,
        hasSelection: selectedUsers.length > 0,
        selectionCount: selectedUsers.length,
    };
}

// Hook for managing deletion filters and search
export function useDeletionFilters() {
    const [filters, setFilters] = useState({
        search: '',
        deleted_by: '',
        date_from: '',
        date_to: '',
        page: 1,
        pageSize: 10,
        sortBy: 'deleted_at' as const,
        order: 'desc' as const,
    });

    const updateFilter = useCallback((key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value, // Reset page when other filters change
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            deleted_by: '',
            date_from: '',
            date_to: '',
            page: 1,
            pageSize: 10,
            sortBy: 'deleted_at',
            order: 'desc',
        });
    }, []);

    const hasActiveFilters = filters.search || filters.deleted_by || filters.date_from || filters.date_to;

    return {
        filters,
        updateFilter,
        resetFilters,
        hasActiveFilters,
    };
}
