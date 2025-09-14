'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useImageTracker } from '@/lib/services/mdx-image-tracker';

/**
 * Hook for managing image cleanup in forms
 * Automatically cleans up unused images when forms are cancelled or submitted
 */
export function useFormImageCleanup() {
    const {
        cleanupUnusedImages,
        markImagesAsUsedFromContent,
        cleanupImagesNotInContent,
        getStats
    } = useImageTracker();

    const isFormSubmittedRef = useRef(false);
    const initialContentRef = useRef<string>('');

    /**
     * Initialize the form with initial content
     */
    const initializeForm = useCallback((initialContent: string = '') => {
        initialContentRef.current = initialContent;
        isFormSubmittedRef.current = false;

        // Mark existing images as used
        if (initialContent) {
            markImagesAsUsedFromContent(initialContent);
        }
    }, [markImagesAsUsedFromContent]);

    /**
     * Handle form submission - mark images as used and cleanup unused ones
     */
    const handleFormSubmit = useCallback(async (finalContent: string) => {
        isFormSubmittedRef.current = true;

        // Mark all images in final content as used
        markImagesAsUsedFromContent(finalContent);

        // Clean up any images not in the final content
        await cleanupImagesNotInContent(finalContent);

        return finalContent;
    }, [markImagesAsUsedFromContent, cleanupImagesNotInContent]);

    /**
     * Handle form cancellation - cleanup all unused images
     */
    const handleFormCancel = useCallback(async () => {
        if (!isFormSubmittedRef.current) {
            await cleanupUnusedImages();
        }
    }, [cleanupUnusedImages]);

    /**
     * Handle form reset - cleanup images not in initial content
     */
    const handleFormReset = useCallback(async () => {
        if (!isFormSubmittedRef.current) {
            const initialContent = initialContentRef.current;
            if (initialContent) {
                markImagesAsUsedFromContent(initialContent);
                await cleanupImagesNotInContent(initialContent);
            } else {
                await cleanupUnusedImages();
            }
        }
    }, [markImagesAsUsedFromContent, cleanupImagesNotInContent, cleanupUnusedImages]);

    /**
     * Get current image statistics
     */
    const getImageStats = useCallback(() => {
        return getStats();
    }, [getStats]);

    // Cleanup on component unmount if form wasn't submitted
    useEffect(() => {
        return () => {
            if (!isFormSubmittedRef.current) {
                // Use setTimeout to avoid cleanup during React's cleanup phase
                setTimeout(() => {
                    cleanupUnusedImages().catch(console.error);
                }, 100);
            }
        };
    }, [cleanupUnusedImages]);

    return {
        initializeForm,
        handleFormSubmit,
        handleFormCancel,
        handleFormReset,
        getImageStats,
    };
}

/**
 * Hook for managing image cleanup in specific form fields
 */
export function useFieldImageCleanup(fieldName: string) {
    const {
        markImagesAsUsedFromContent,
        cleanupImagesNotInContent
    } = useImageTracker();

    const previousContentRef = useRef<string>('');

    /**
     * Handle field content change
     */
    const handleFieldChange = useCallback(async (newContent: string) => {
        const previousContent = previousContentRef.current;

        // Mark new images as used
        markImagesAsUsedFromContent(newContent);

        // If content was removed, cleanup images that are no longer present
        if (previousContent && previousContent !== newContent) {
            // Find images that were in previous content but not in new content
            const previousImages: string[] = previousContent.match(/!\[.*?\]\((.*?)\)/g) || [];
            const newImages: string[] = newContent.match(/!\[.*?\]\((.*?)\)/g) || [];

            const removedImages = previousImages.filter(img => !newImages.includes(img));

            if (removedImages.length > 0) {
                // Small delay to avoid cleanup during rapid typing
                setTimeout(async () => {
                    await cleanupImagesNotInContent(newContent);
                }, 1000);
            }
        }

        previousContentRef.current = newContent;
    }, [markImagesAsUsedFromContent, cleanupImagesNotInContent]);

    /**
     * Reset field tracking
     */
    const resetField = useCallback(() => {
        previousContentRef.current = '';
    }, []);

    return {
        handleFieldChange,
        resetField,
    };
}

/**
 * Hook for managing image cleanup in dialogs/modals
 */
export function useDialogImageCleanup() {
    const { cleanupUnusedImages } = useImageTracker();
    const dialogOpenRef = useRef(false);

    /**
     * Handle dialog open
     */
    const handleDialogOpen = useCallback(() => {
        dialogOpenRef.current = true;
    }, []);

    /**
     * Handle dialog close with cleanup
     */
    const handleDialogClose = useCallback(async (wasSubmitted: boolean = false) => {
        if (dialogOpenRef.current && !wasSubmitted) {
            await cleanupUnusedImages();
        }
        dialogOpenRef.current = false;
    }, [cleanupUnusedImages]);

    /**
     * Handle dialog submit (no cleanup needed)
     */
    const handleDialogSubmit = useCallback(() => {
        dialogOpenRef.current = false;
    }, []);

    return {
        handleDialogOpen,
        handleDialogClose,
        handleDialogSubmit,
    };
}

/**
 * Utility hook for automatic cleanup on page navigation
 */
export function usePageNavigationCleanup() {
    const { cleanupUnusedImages } = useImageTracker();

    useEffect(() => {
        const handleBeforeUnload = () => {
            // Cleanup unused images before page unload
            cleanupUnusedImages().catch(console.error);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Cleanup when page becomes hidden
                cleanupUnusedImages().catch(console.error);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [cleanupUnusedImages]);
}

/**
 * Combined hook for comprehensive form image management
 */
export function useFormImageManagement(options?: {
    autoCleanupOnNavigation?: boolean;
    cleanupDelayMs?: number;
}) {
    const formCleanup = useFormImageCleanup();
    const dialogCleanup = useDialogImageCleanup();

    if (options?.autoCleanupOnNavigation !== false) {
        usePageNavigationCleanup();
    }

    return {
        ...formCleanup,
        ...dialogCleanup,
        // Combined handlers
        handleFormSubmitAndClose: async (content: string) => {
            await formCleanup.handleFormSubmit(content);
            dialogCleanup.handleDialogSubmit();
        },
        handleFormCancelAndClose: async () => {
            await formCleanup.handleFormCancel();
            await dialogCleanup.handleDialogClose(false);
        },
    };
}
