'use client';

import type { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAdminIntakesByCourseAndYear } from '@/hooks/admin/intakes-optimized';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import type { IntakeListItem } from '@/lib/types/intakes';
import { Skeleton } from '../ui/skeleton';

interface IntakeSelectProps {
    field: ControllerRenderProps<ZodEnrollmentInsertType, 'intake_id'>;
    disabled?: boolean;
    courseId?: string;
    getItemOnValueChanges?: (item: IntakeListItem) => void;
}

export default function IntakeSelect({
    field,
    disabled,
    courseId,
    getItemOnValueChanges,
}: IntakeSelectProps) {
    // Use the unified hook that handles both course-specific and general intake listing
    const currentYear = new Date().getFullYear().toString();
    const queryResult = useAdminIntakesByCourseAndYear(courseId, currentYear);

    // Extract intakes based on the response structure
    const intakes = queryResult.data?.intakes || [];

    const error = queryResult.error;
    const isLoading = queryResult.isLoading;

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />{' '}
            </div>
        );
    }

    if (error) {
        toast.error(
            error instanceof Error
                ? error.message
                : 'something went wrong. please contact to adminstrator'
        );
    }
    if (intakes?.length === 0) {
        return <span className="">No intake found for course enrollments</span>;
    }
    return (
        <Select
            disabled={disabled || isLoading}
            onValueChange={value => {
                const selectedIntakes = intakes?.find(
                    (item: any) => item.id === value
                );
                if (selectedIntakes) {
                    field.onChange(value);
                    // Pass the intake directly since it's already the correct type
                    if (getItemOnValueChanges) {
                        getItemOnValueChanges(selectedIntakes);
                    }
                }
            }}
            value={field.value ?? undefined}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a intake" />
            </SelectTrigger>
            <SelectContent className="">
                {intakes?.map((intake: any) => (
                    <SelectItem key={intake.id} value={intake.id}>
                        <div className="flex items-center gap-2">
                            <span className="font-bold ">
                                {intake.course?.title}
                            </span>
                            <span className="text-gray-500 text-sm ">
                                (Capacity: {intake.capacity})
                            </span>
                            <span className="text-gray-700 text-sm dark:text-gray-300">
                                {new Date(intake.start_date).toLocaleDateString(
                                    'en-GB',
                                    {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    }
                                )}{' '}
                                -{' '}
                                {new Date(intake.end_date).toLocaleDateString(
                                    'en-GB',
                                    {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    }
                                )}
                            </span>
                            <Badge
                                className="dark:bg-gray-700 "
                                variant={
                                    intake.is_open ? 'default' : 'destructive'
                                }
                            >
                                {intake.is_open ? 'Open' : 'Closed'}
                            </Badge>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
