import type { NextRequest } from 'next/server';
import { adminDeleteEnrollment } from '@/server-actions/admin/enrollments';
import { logger } from '@/utils/logger';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await adminDeleteEnrollment(params.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error('Failed to delete enrollment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      enrollmentId: params.id
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
