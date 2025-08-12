import type { NextRequest } from 'next/server';
import { adminDeleteEnrollment } from '@/lib/server-actions/admin/enrollments';
import { logger } from '@/utils/logger';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDeleteEnrollment(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    const { id } = await params;
    logger.error('Failed to delete enrollment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      enrollmentId: id,
    });
    return new Response(
      JSON.stringify({ message: 'Failed to delete enrollment.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
