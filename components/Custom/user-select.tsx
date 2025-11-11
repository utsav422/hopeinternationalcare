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
import { useAdminProfileList } from '@/hooks/admin/profiles-optimized';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import type { ZodSelectProfileType } from '@/lib/db/drizzle-zod-schema/profiles';

interface UserSelectProps {
    field: ControllerRenderProps<ZodEnrollmentInsertType, 'user_id'>;
    disabled?: boolean;
}

export default function UserSelect({ field, disabled }: UserSelectProps) {
    // Use the optimized hook with parameters to get all profiles
    const {
        data: result,
        error,
        isLoading,
    } = useAdminProfileList({
        page: 1,
        pageSize: 9999,
        filters: [{ id: 'role', value: 'authenticated' }],
    });
    const profiles = result?.data?.data;
    // ProfileListItem doesn't have role field, so we need to adjust the filter
    // Since the ProfileListItem doesn't include role, we'll include all profiles
    const filteredProfiles = profiles;

    if (isLoading) {
        return <p className="">Loading courses...</p>;
    }

    if (error) {
        toast.error(
            error instanceof Error
                ? error?.message
                : 'something unexpected happed. contact to adminstrator'
        );
    }

    if (!filteredProfiles || filteredProfiles?.length === 0) {
        return <span className="">No user found for enrollment selection</span>;
    }
    return (
        <Select
            disabled={disabled || field.disabled || isLoading}
            onValueChange={field.onChange}
            value={field.value ?? undefined}
        >
            <SelectTrigger className="w-full" ref={field.ref}>
                <SelectValue placeholder="Select a user profile" />
            </SelectTrigger>
            <SelectContent className="">
                {filteredProfiles?.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                        <span className="font-bold ">{profile.email}</span>:{' '}
                        <span className="font-bold ">{profile.full_name}</span>:
                        <span className="font-bold ">{profile.phone}</span>:
                        <span className="font-bold ">{'authenticated'}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
