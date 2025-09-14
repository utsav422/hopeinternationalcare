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
import { useAdminEnrollmentListAll } from '@/hooks/admin/enrollments';
import type { EnrollmentWithDetails } from '@/lib/db/drizzle-zod-schema/enrollments';
import type { ZodInsertPaymentType } from '@/lib/db/drizzle-zod-schema/payments';
import { Skeleton } from '../ui/skeleton';

interface EnrollmentSelectProps {
    field: ControllerRenderProps<ZodInsertPaymentType, 'enrollment_id'>;
    disabled?: boolean;
    getItemOnValueChanges?: (item: EnrollmentWithDetails) => void;
}

export default function EnrollmentSelect({
    field,
    disabled,
    getItemOnValueChanges,
}: EnrollmentSelectProps) {
    const {
        data: enrollmentsWithDetails,
        error,
        isLoading,
    } = useAdminEnrollmentListAll();

    if (error || !enrollmentsWithDetails) {
        toast.error(
            error?.message ?? 'Data couldnt found. please contact to adminstrator'
        );
    }

    if (enrollmentsWithDetails && enrollmentsWithDetails.length === 0) {
        return (
            <span className="">
                No intake found for course enrollments
            </span>
        );
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
            onValueChange={(value) => {
                const selectedEnrollmentWIthDetails = enrollmentsWithDetails?.find(
                    (itemWithDetails: EnrollmentWithDetails) =>
                        itemWithDetails.enrollment.id === value
                );
                if (selectedEnrollmentWIthDetails) {
                    field.onChange(value);
                    getItemOnValueChanges?.(selectedEnrollmentWIthDetails);
                }
            }}
            value={field.value ?? undefined}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Enrollments" />
            </SelectTrigger>
            <SelectContent className="">
                {enrollmentsWithDetails?.map(
                    (itemWithDetails: EnrollmentWithDetails) => (
                        <SelectItem
                            key={itemWithDetails.enrollment.id}
                            value={itemWithDetails.enrollment.id}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-bold ">
                                    Enrolled Date: {itemWithDetails.enrollment.enrollment_date}
                                </span>
                                <span className="text-gray-500 text-sm ">
                                    (user: {itemWithDetails.user?.full_name})
                                </span>
                                <span className="text-gray-700 text-sm dark:text-gray-300">
                                    {new Date(
                                        itemWithDetails.enrollment.enrollment_date as string
                                    ).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}{' '}
                                </span>
                            </div>
                        </SelectItem>
                    )
                )}
            </SelectContent>
        </Select>
    );
}
