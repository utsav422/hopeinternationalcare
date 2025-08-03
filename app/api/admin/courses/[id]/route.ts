import type { NextRequest } from 'next/server';
import { adminDeleteCourse } from '@/server-actions/admin/courses';

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await adminDeleteCourse(params.id);
  return new Response(null, { status: 200 });
}
