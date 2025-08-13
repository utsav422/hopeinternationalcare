import { type NextRequest, NextResponse } from 'next/server';

import { createAdminSupabaseClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);

  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const adminAuthClient = supabaseAdmin.auth.admin;
    const { data, error } = await adminAuthClient.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
