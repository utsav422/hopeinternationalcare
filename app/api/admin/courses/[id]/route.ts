import { type NextRequest, NextResponse } from 'next/server';
import { adminDeleteCourse } from '@/lib/server-actions/admin/courses';

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }
    const result = await adminDeleteCourse(id);

    if (result.success) {
      return NextResponse.json(null, { status: 204 });
    }
    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
