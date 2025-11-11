'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

export default function UserProfileComponent() {
    const { data: userSession } = useSuspenseQuery<User>({
        queryKey: queryKeys.users.session,
        queryFn: async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error || !session) {
                throw error;
            }
            return session.user;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });

    const user = userSession;

    if (!user) {
        return <div>No user data available</div>;
    }

    return (
        <div className="my-16">
            <h1>User Profile</h1>
            <p>Welcome, {user.email}!</p>
            {/* Add more profile details here */}
        </div>
    );
}
