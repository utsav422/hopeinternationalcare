import { type NextRequest, NextResponse } from 'next/server';
import { adminDeleteCourse } from '@/server-actions/admin/courses';

export async function DELETE(request: NextRequest) {
  const id = request.url.split('/').pop();
  await adminDeleteCourse(id as string);
  return NextResponse.json(null, { status: 200 });
}
