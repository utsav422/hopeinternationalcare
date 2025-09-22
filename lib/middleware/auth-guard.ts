import { createServerSupabaseClient } from '@/utils/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Middleware to require admin privileges
 */
export async function requireAdmin() {
  try {
    const client = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (error) {
      logger.warn('Auth error in requireAdmin', { error: error.message });
      throw new Error('Authentication failed');
    }

    if (!user) {
      logger.warn('No user found in requireAdmin');
      throw new Error('Authentication required');
    }

    // Check if user has admin role
    if (user.role !== 'service_role') {
      logger.warn('Insufficient permissions in requireAdmin', {
        userId: user.id,
        role: user.role
      });
      throw new Error('Admin access required');
    }

    logger.info('Admin access granted', { userId: user.id });
    return user;
  } catch (error) {
    logger.error('Error in requireAdmin', { error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}