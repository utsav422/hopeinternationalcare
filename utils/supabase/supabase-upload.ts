// /lib/utils/supabase-upload.ts
import { createServerSupabaseClient } from '@/utils/supabase/server';

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToSupabase(
    formData: FormData
): Promise<string> {
    const file = formData.get('file');
    const folder = formData.get('folder');
    const file_name = formData.get('file_name');
    if (!(file instanceof File)) {
        throw new Error('Invalid file upload');
    }
    if (!(folder && file_name)) {
        throw new Error('Folder and file name are required');
    }
    const client = await createServerSupabaseClient();

    const fileName = `${folder}/${Date.now()}-${file_name}`;

    const { error } = await client.storage
        .from('media') // Bucket name (must exist in Supabase)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const {
        data: { publicUrl },
    } = client.storage.from('media').getPublicUrl(fileName);

    return publicUrl;
}
