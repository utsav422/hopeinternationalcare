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
import { useGetAllActiveIntake } from '@/hooks/admin/intakes';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import type { IntakeWithCourse } from '@/lib/server-actions/admin/intakes';
import { Skeleton } from '../ui/skeleton';

interface IntakeSelectProps {
  field: ControllerRenderProps<ZodEnrollmentInsertType, 'intake_id'>;
  disabled?: boolean;
  getItemOnValueChanges?: (item: IntakeWithCourse) => void;
}

export default function IntakeSelect({
  field,
  disabled,
  getItemOnValueChanges,
}: IntakeSelectProps) {
  const { data: intakes, error, isLoading } = useGetAllActiveIntake();

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
    return (
      <span className="dark:text-gray-400">
        No intake found for course enrollments
      </span>
    );
  }
  return (
    <Select
      disabled={disabled || isLoading}
      onValueChange={(value) => {
        const selectedIntakes = intakes?.find((item) => item.id === value);
        if (selectedIntakes) {
          field.onChange(value);
          getItemOnValueChanges?.(selectedIntakes);
        }
      }}
      value={field.value ?? undefined}
    >
      <SelectTrigger className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        <SelectValue placeholder="Select a intake" />
      </SelectTrigger>
      <SelectContent className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        {intakes?.map((intake) => (
          <SelectItem
            className="dark:hover:bg-gray-700"
            key={intake.id}
            value={intake.id}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold dark:text-white">
                {intake.courseTitle}
              </span>
              <span className="text-gray-500 text-sm dark:text-gray-400">
                (Capacity: {intake.capacity})
              </span>
              <span className="text-gray-700 text-sm dark:text-gray-300">
                {new Date(intake.start_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                -{' '}
                {new Date(intake.end_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <Badge
                className="dark:bg-gray-700 dark:text-gray-200"
                variant={intake.is_open ? 'default' : 'destructive'}
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
