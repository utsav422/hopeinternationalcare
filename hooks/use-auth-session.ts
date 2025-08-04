'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getSession();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user || null);
        setLoading(false);
      },
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return { user, loading };
}
