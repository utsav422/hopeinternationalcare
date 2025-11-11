import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { stat } from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'No file found.',
            });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({
                success: false,
                error: 'File must be an image.',
            });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                error: 'File size must be less than 5MB.',
            });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await stat(uploadDir);
        } catch {
            await mkdir(uploadDir, { recursive: true });
        }

        // Use a timestamp for unique filenames
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const uploadPath = path.join(uploadDir, filename);

        await writeFile(uploadPath, buffer);
        console.log(`File uploaded to ${uploadPath}`);

        // Return the public URL
        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
        });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json(
            { success: false, error: 'Error saving file.' },
            { status: 500 }
        );
    }
}

export const runtime = 'nodejs';
