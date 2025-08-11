import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/utils/logger';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.auth.admin.deleteUser(
      params.id,
      true
    );
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
    logger.error('Failed to delete user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: params.id
    });
    return new Response(
      JSON.stringify({ message: 'Failed to delete user.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
