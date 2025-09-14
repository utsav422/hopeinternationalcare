'use client';

import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';

/**
 * Upload image for MDX editor to Supabase storage
 */
export async function uploadImageForMDX(file: File): Promise<string> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('Image size must be less than 10MB');
        }


        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `mdx-images/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        toast.error(errorMessage);
        throw error;
    }
}

/**
 * Delete image from Supabase storage
 */
export async function deleteImageFromMDX(imageUrl: string): Promise<void> {
    try {

        // Extract file path from URL
        const urlParts = imageUrl.split('/');
        const mediaIndex = urlParts.findIndex(part => part === 'media');

        if (mediaIndex === -1 || mediaIndex === urlParts.length - 1) {
            throw new Error('Invalid image URL format');
        }

        const filePath = urlParts.slice(mediaIndex + 1).join('/');

        const { error } = await supabase.storage
            .from('media')
            .remove([filePath]);

        if (error) {
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw here as this is often called during cleanup
    }
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.includes('/media/mdx-images/');
    } catch {
        return false;
    }
}

/**
 * Extract alt text from markdown image syntax
 */
export function extractAltText(markdownImage: string): string {
    const match = markdownImage.match(/!\[(.*?)\]/);
    return match ? match[1] : '';
}

/**
 * Create markdown image syntax
 */
export function createMarkdownImage(url: string, alt: string = ''): string {
    return `![${alt}](${url})`;
}

/**
 * Handle image paste from clipboard
 */
export async function handleImagePaste(clipboardData: DataTransfer): Promise<string | null> {
    const items = Array.from(clipboardData.items);

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                try {
                    const url = await uploadImageForMDX(file);
                    return createMarkdownImage(url, 'Pasted image');
                } catch (error) {
                    console.error('Error uploading pasted image:', error);
                    return null;
                }
            }
        }
    }

    return null;
}

/**
 * Handle image drop
 */
export async function handleImageDrop(files: FileList): Promise<string[]> {
    const uploadPromises: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            uploadPromises.push(uploadImageForMDX(file));
        }
    }

    try {
        const urls = await Promise.all(uploadPromises);
        return urls.map(url => createMarkdownImage(url, 'Dropped image'));
    } catch (error) {
        console.error('Error uploading dropped images:', error);
        throw error;
    }
}

/**
 * Resize image if needed (client-side)
 */
export function resizeImage(file: File, maxWidth: number = 1200, maxHeight: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const resizedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now(),
                    });
                    resolve(resizedFile);
                } else {
                    resolve(file);
                }
            }, file.type, quality);
        };

        img.src = URL.createObjectURL(file);
    });
}


