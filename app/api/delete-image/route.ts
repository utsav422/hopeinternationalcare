import { unlink } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl || typeof imageUrl !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Invalid image URL.' },
                { status: 400 }
            );
        }

        // Extract filename from URL
        const filename = imageUrl.split('/').pop();
        if (!filename) {
            return NextResponse.json(
                { success: false, error: 'Invalid image URL.' },
                { status: 400 }
            );
        }

        const filePath = path.join(
            process.cwd(),
            'public',
            'uploads',
            filename
        );

        // Basic security check: ensure the path is within the uploads directory
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!filePath.startsWith(uploadsDir)) {
            return NextResponse.json(
                { success: false, error: 'Invalid path.' },
                { status: 403 }
            );
        }

        await unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        // Extract imageUrl from request body for error logging
        let imageUrl = '';
        try {
            const body = await request.json();
            imageUrl = body.imageUrl || '';
        } catch (e) {
            // Ignore parsing errors
        }

        // It's okay if the file doesn't exist (e.g., already deleted)
        if (error.code === 'ENOENT') {
            console.log(`File not found, could not delete: ${imageUrl}`);
            return NextResponse.json({
                success: true,
                message: 'File not found.',
            });
        }
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { success: false, error: 'Error deleting file.' },
            { status: 500 }
        );
    }
}

export const runtime = 'nodejs';
