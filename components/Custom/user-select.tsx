'use client';

import { useEffect, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminGetAllProfiles } from '@/server-actions/admin/profiles';
import type { ZodInsertEnrollmentType } from '@/utils/db/drizzle-zod-schema/enrollment';
import type { ZodSelectProfileType } from '@/utils/db/drizzle-zod-schema/profiles';

interface UserSelectProps {
  field: ControllerRenderProps<ZodInsertEnrollmentType, 'user_id'>;
  disabled?: boolean;
}

export default function UserSelect({ field, disabled }: UserSelectProps) {
  const [profiles, setProfiles] = useState<ZodSelectProfileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await adminGetAllProfiles();
        setProfiles(
          data?.filter(
            (item) => item.role === 'authenticated'
          ) as ZodSelectProfileType[]
        );
      } catch {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (profiles.length === 0) {
    return <span>No user item found for enrollment selection</span>;
  }
  return (
    <Select
      disabled={disabled || loading}
      onValueChange={field.onChange}
      value={field.value ?? undefined}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a user profile" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            <span className="font-bold">{profile.email}</span>
            :: <span className="font-bold">{profile.full_name}</span>
            ::<span className="font-bold">{profile.phone}</span>
            ::<span className="font-bold">{profile.role}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
