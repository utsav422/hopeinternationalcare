import { useEffect } from 'react';

import { supabase } from '@/utils/supabase/client';

export const useRealtime = (table: string, callback: () => void) => {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
};
