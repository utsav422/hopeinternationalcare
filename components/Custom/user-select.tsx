'use client';
import type { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllProfiles } from '@/hooks/admin/profiles';
import type { ZodEnrollmentInsertType } from '@/utils/db/drizzle-zod-schema/enrollment';

interface UserSelectProps {
  field: ControllerRenderProps<ZodEnrollmentInsertType, 'user_id'>;
  disabled?: boolean;
}

export default function UserSelect({ field, disabled }: UserSelectProps) {
  const { data: queryResult, error, isLoading } = useGetAllProfiles();
  const profiles = queryResult?.data?.filter(
    (item) => item.role === 'authenticated'
  );

  if (isLoading) {
    return <p className="dark:text-white">Loading courses...</p>;
  }

  if (error) {
    toast.error(
      error instanceof Error
        ? error?.message
        : 'something unexpected happed. contact to adminstrator'
    );
  }

  if (!profiles || profiles?.length === 0) {
    return (
      <span className="dark:text-gray-400">
        No user item found for enrollment selection
      </span>
    );
  }
  return (
    <Select
      disabled={disabled || isLoading}
      onValueChange={field.onChange}
      value={field.value ?? undefined}
    >
      <SelectTrigger className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        <SelectValue placeholder="Select a user profile" />
      </SelectTrigger>
      <SelectContent className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        {profiles.map((profile) => (
          <SelectItem
            className="dark:hover:bg-gray-700"
            key={profile.id}
            value={profile.id}
          >
            <span className="font-bold dark:text-white">{profile.email}</span>
            ::{' '}
            <span className="font-bold dark:text-white">
              {profile.full_name}
            </span>
            ::<span className="font-bold dark:text-white">{profile.phone}</span>
            ::<span className="font-bold dark:text-white">{profile.role}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
