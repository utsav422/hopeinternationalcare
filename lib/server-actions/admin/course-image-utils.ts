import { createServerSupabaseClient } from '@/utils/supabase/server';

/**
 * Handles course image upload and deletion
 * @param imageFile New image file to upload (if any)
 * @param oldImageUrl URL of existing image to delete (if any)
 * @returns Object with publicUrl of new image or null if no image operations were performed
 */
export async function handleCourseImage(
    imageFile: File | null,
    oldImageUrl: string | null
) {
    // If no image file provided, return null
    if (!imageFile || imageFile.size === 0) {
        return { publicUrl: null };
    }

    const client = await createServerSupabaseClient();

    // Delete old image if exists
    if (oldImageUrl) {
        const oldImageKey = oldImageUrl.substring(
            oldImageUrl.lastIndexOf('media/') + 'media/'.length
        );
        try {
            await client.storage.from('media').remove([oldImageKey]);
        } catch (e) {
            const err = e as Error;
            console.warn(`Failed to delete old image: ${err.message}`);
            // Continue with upload even if deletion fails
        }
    }

    // Upload new image
    const fileName = `course_image/${Date.now()}-${imageFile.name}`;
    const { error: uploadError } = await client.storage
        .from('media')
        .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const {
        data: { publicUrl },
    } = client.storage.from('media').getPublicUrl(fileName);

    return { publicUrl };
}