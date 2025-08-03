'use client';

import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import React from 'react';
import { createClient } from '@/utils/supabase/client'; // Assuming this path for supabase client

function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/sign-in'); // Redirect to sign-in if not authenticated
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div>Loading profile...</div>; // Or a more sophisticated loading spinner
  }

  if (!user) {
    return null; // Should not happen due to redirect, but as a fallback
  }

  return (
    <div className="my-16 ">
      <h1>User Profile</h1>
      <p>Welcome, {user.email}!</p>
      {/* Add more profile details here */}
    </div>
  );
}

export default ProfilePage;
