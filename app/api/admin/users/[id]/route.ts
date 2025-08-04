import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/utils/auth-guard';
import { createClient } from '@/utils/supabase/admin';

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.auth.admin.deleteUser(
      params.id,
      true
    );
    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error(
        'Data not found!, Something enexpected happed, please contact to adminstrator'
      );
    }

    return new Response(null, { status: 200 });
  } catch (_error) {
    // TODO: Log error deleting enrollment using a proper logging mechanism
    return new Response(
      JSON.stringify({ message: 'Failed to soft delete user.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}