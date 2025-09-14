'use client';

import { useMemo } from 'react';
import { deleteImageFromMDX } from './mdx-image-upload';

/**
 * Image tracking system for MDX editor
 * Tracks uploaded images and provides cleanup functionality
 */

interface TrackedImage {
    url: string;
    uploadedAt: Date;
    sessionId: string;
    isUsed: boolean;
}

class ImageTracker {
    private images: Map<string, TrackedImage> = new Map();
    private sessionId: string;

    constructor() {
        this.sessionId = this.generateSessionId();

        // Cleanup on page unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.cleanupUnusedImages();
            });
        }
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }

    /**
     * Track a newly uploaded image
     */
    trackImage(url: string): void {
        this.images.set(url, {
            url,
            uploadedAt: new Date(),
            sessionId: this.sessionId,
            isUsed: false,
        });
    }

    /**
     * Mark an image as used (inserted into content)
     */
    markImageAsUsed(url: string): void {
        const image = this.images.get(url);
        if (image) {
            image.isUsed = true;
            this.images.set(url, image);
        }
    }

    /**
     * Remove an image from tracking
     */
    untrackImage(url: string): void {
        this.images.delete(url);
    }

    /**
     * Get all tracked images for current session
     */
    getTrackedImages(): TrackedImage[] {
        return Array.from(this.images.values()).filter(
            img => img.sessionId === this.sessionId
        );
    }

    /**
     * Get unused images (uploaded but not inserted)
     */
    getUnusedImages(): TrackedImage[] {
        return this.getTrackedImages().filter(img => !img.isUsed);
    }

    /**
     * Clean up a specific image
     */
    async cleanupImage(url: string): Promise<void> {
        try {
            await deleteImageFromMDX(url);
            this.untrackImage(url);
        } catch (error) {
            console.error('Failed to cleanup image:', url, error);
        }
    }

    /**
     * Clean up all unused images
     */
    async cleanupUnusedImages(): Promise<void> {
        const unusedImages = this.getUnusedImages();

        const cleanupPromises = unusedImages.map(async (image) => {
            try {
                await deleteImageFromMDX(image.url);
                this.untrackImage(image.url);
            } catch (error) {
                console.error('Failed to cleanup unused image:', image.url, error);
            }
        });

        await Promise.allSettled(cleanupPromises);
    }

    /**
     * Clean up old images (older than specified minutes)
     */
    async cleanupOldImages(maxAgeMinutes: number = 60): Promise<void> {
        const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
        const oldImages = this.getTrackedImages().filter(
            img => img.uploadedAt < cutoffTime && !img.isUsed
        );

        const cleanupPromises = oldImages.map(async (image) => {
            try {
                await deleteImageFromMDX(image.url);
                this.untrackImage(image.url);
            } catch (error) {
                console.error('Failed to cleanup old image:', image.url, error);
            }
        });

        await Promise.allSettled(cleanupPromises);
    }

    /**
     * Extract image URLs from markdown content
     */
    extractImageUrls(markdown: string): string[] {
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const urls: string[] = [];
        let match;

        while ((match = imageRegex.exec(markdown)) !== null) {
            urls.push(match[1]);
        }

        return urls;
    }

    /**
     * Mark images as used based on markdown content
     */
    markImagesAsUsedFromContent(markdown: string): void {
        const imageUrls = this.extractImageUrls(markdown);
        imageUrls.forEach(url => {
            this.markImageAsUsed(url);
        });
    }

    /**
     * Clean up images not present in the final content
     */
    async cleanupImagesNotInContent(markdown: string): Promise<void> {
        const usedUrls = this.extractImageUrls(markdown);
        const trackedImages = this.getTrackedImages();

        const unusedImages = trackedImages.filter(
            img => !usedUrls.includes(img.url)
        );

        const cleanupPromises = unusedImages.map(async (image) => {
            try {
                await deleteImageFromMDX(image.url);
                this.untrackImage(image.url);
            } catch (error) {
                console.error('Failed to cleanup unused image:', image.url, error);
            }
        });

        await Promise.allSettled(cleanupPromises);
    }

    /**
     * Get cleanup statistics
     */
    getStats(): {
        total: number;
        used: number;
        unused: number;
        sessionId: string;
    } {
        const tracked = this.getTrackedImages();
        const used = tracked.filter(img => img.isUsed);
        const unused = tracked.filter(img => !img.isUsed);

        return {
            total: tracked.length,
            used: used.length,
            unused: unused.length,
            sessionId: this.sessionId,
        };
    }
}

// Global instance
let imageTracker: ImageTracker | null = null;

/**
 * Get the global image tracker instance
 */
export function getImageTracker(): ImageTracker {
    if (!imageTracker) {
        imageTracker = new ImageTracker();
    }
    return imageTracker;
}

/**
 * Hook for React components to use image tracking
 */
export function useImageTracker() {
    const tracker = getImageTracker();

    return useMemo(() => ({
        trackImage: (url: string) => tracker.trackImage(url),
        markImageAsUsed: (url: string) => tracker.markImageAsUsed(url),
        untrackImage: (url: string) => tracker.untrackImage(url),
        cleanupImage: (url: string) => tracker.cleanupImage(url),
        cleanupUnusedImages: () => tracker.cleanupUnusedImages(),
        cleanupImagesNotInContent: (markdown: string) =>
            tracker.cleanupImagesNotInContent(markdown),
        markImagesAsUsedFromContent: (markdown: string) =>
            tracker.markImagesAsUsedFromContent(markdown),
        getStats: () => tracker.getStats(),
        getUnusedImages: () => tracker.getUnusedImages(),
    }), [tracker]);
}

/**
 * Utility function to setup form cleanup
 */
export function setupFormImageCleanup(
    onFormCancel?: () => void,
    onFormSubmit?: (content: string) => void
) {
    const tracker = getImageTracker();

    return {
        onCancel: async () => {
            await tracker.cleanupUnusedImages();
            onFormCancel?.();
        },
        onSubmit: async (content: string) => {
            tracker.markImagesAsUsedFromContent(content);
            await tracker.cleanupImagesNotInContent(content);
            onFormSubmit?.(content);
        },
    };
}
