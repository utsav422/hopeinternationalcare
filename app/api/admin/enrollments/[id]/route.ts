import type { NextRequest } from 'next/server';
import { adminDeleteEnrollment } from '@/server-actions/admin/enrollments';

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res_params = await params;
    await adminDeleteEnrollment(res_params.id);
    return new Response(null, { status: 200 });
  } catch (_error) {
    // TODO: Log error deleting enrollment using a proper logging mechanism
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