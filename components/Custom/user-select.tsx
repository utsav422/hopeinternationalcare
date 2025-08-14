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
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string | null;
    created_at: string;
    updated_at: string;
}

interface UserSelectProps {
    field: ControllerRenderProps<ZodEnrollmentInsertType, 'user_id'>;
    disabled?: boolean;
}

export default function UserSelect({ field, disabled }: UserSelectProps) {
    const { data: profiles, error, isLoading } = useGetAllProfiles();
    const filteredProfiles = profiles?.filter(
        (item: Profile) => item.role === 'authenticated'
    );

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
        return (
            <span className="">
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
            <SelectTrigger className="">
                <SelectValue placeholder="Select a user profile" />
            </SelectTrigger>
            <SelectContent className="">
                {filteredProfiles?.map((profile: Profile) => (
                    <SelectItem
                        key={profile.id}
                        value={profile.id}
                    >
                        <span className="font-bold ">{profile.email}</span>
                        ::{' '}
                        <span className="font-bold ">
                            {profile.full_name}
                        </span>
                        ::<span className="font-bold ">{profile.phone}</span>
                        ::<span className="font-bold ">{profile.role}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
