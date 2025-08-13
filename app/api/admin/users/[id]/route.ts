import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/utils/logger';

import { createAdminSupabaseClient } from '@/utils/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const adminAuthClient = supabaseAdmin.auth.admin;
    const { data, error } = await adminAuthClient.getUserById(id);

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

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.auth.admin.deleteUser(id, true);
    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error(
        'Data not found! Something unexpected happened, please contact the administrator'
      );
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    const { id } = await params;
    logger.error('Failed to delete user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: id,
    });
    return new Response(JSON.stringify({ message: 'Failed to delete user.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
