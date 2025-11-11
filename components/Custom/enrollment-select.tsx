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
import { useAdminEnrollmentList } from '@/hooks/admin/enrollments';
import type { EnrollmentListItem } from '@/lib/types/enrollments';
import type { ZodInsertPaymentType } from '@/lib/db/drizzle-zod-schema/payments';
import { Skeleton } from '../ui/skeleton';

interface EnrollmentSelectProps {
    field: ControllerRenderProps<ZodInsertPaymentType, 'enrollment_id'>;
    disabled?: boolean;
    getItemOnValueChanges?: (item: EnrollmentListItem) => void;
}

export default function EnrollmentSelect({
    field,
    disabled,
    getItemOnValueChanges,
}: EnrollmentSelectProps) {
    const {
        data: queryResult,
        error,
        isLoading,
    } = useAdminEnrollmentList({ all: true });

    if (error) {
        toast.error(
            error?.message ??
                'Data couldnt found. please contact to adminstrator'
        );
    }

    const enrollments = queryResult?.data;

    if (enrollments && enrollments.length === 0) {
        return <span className="">No intake found for course enrollments</span>;
    }
    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />{' '}
            </div>
        );
    }
    return (
        <Select
            disabled={disabled || isLoading}
            onValueChange={value => {
                const selectedEnrollment = enrollments?.find(
                    (item: EnrollmentListItem) => item.id === value
                );
                if (selectedEnrollment) {
                    field.onChange(value);
                    if (getItemOnValueChanges) {
                        getItemOnValueChanges(selectedEnrollment);
                    }
                }
            }}
            value={field.value ?? undefined}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Enrollments" />
            </SelectTrigger>
            <SelectContent className="">
                {enrollments?.map((item: EnrollmentListItem) => (
                    <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                            <span className="font-bold ">
                                Enrolled Date: {item.created_at}
                            </span>
                            <span className="text-gray-500 text-sm ">
                                (user: {item.user?.fullName})
                            </span>
                            <span className="text-gray-700 text-sm dark:text-gray-300">
                                {new Date(
                                    item.created_at as string
                                ).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })}{' '}
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
