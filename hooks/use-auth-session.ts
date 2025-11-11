'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { queryKeys } from '../lib/query-keys';

export function useAuthSession() {
    const queryClient = useQueryClient();

    const { data: user, isLoading: loading } = useQuery({
        queryKey: queryKeys.users.session,
        queryFn: async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                throw error;
            }
            return data.user;
        },
        staleTime: Number.POSITIVE_INFINITY, // Session data is usually stable
        refetchOnWindowFocus: true, // Re-fetch on window focus to keep the session fresh
    });
    useEffect(() => {
        const {
            data: { subscription: authListener },
        } = supabase.auth.onAuthStateChange((_, session) => {
            if (session?.user) {
                queryClient.setQueryData(queryKeys.users.session, session.user);
            } else {
                queryClient.setQueryData(queryKeys.users.session, null);
            }
        });

        return () => {
            authListener?.unsubscribe();
        };
    }, [queryClient]);

    return { user, loading };
}
