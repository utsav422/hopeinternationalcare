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
import { adminGetAllEnrollments } from '@/server-actions/admin/enrollments';
import type { CustomEnrollmentsAndOthers } from '@/utils/db/drizzle-zod-schema/enrollment';
import type { ZodInsertPaymentType } from '@/utils/db/drizzle-zod-schema/payments';
import { EnrollmentStatus } from '@/utils/db/schema/enums';

interface EnrollmentSelectProps {
  field: ControllerRenderProps<ZodInsertPaymentType, 'enrollment_id'>;
  disabled?: boolean;
  getItemOnValueChanges?: (item: CustomEnrollmentsAndOthers) => void;
}

export default function EnrollmentSelect({
  field,
  disabled,
  getItemOnValueChanges,
}: EnrollmentSelectProps) {
  const [enrollments, setEnrollments] = useState<CustomEnrollmentsAndOthers[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await adminGetAllEnrollments();
        setEnrollments(
          data?.filter(
            (item) => item.status === EnrollmentStatus.requested
          ) as CustomEnrollmentsAndOthers[]
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
    return <p className="dark:text-white">Loading courses...</p>;
  }

  if (error) {
    return <p className="text-red-500 dark:text-red-400">{error}</p>;
  }
  if (enrollments.length === 0) {
    return <span className="dark:text-gray-400">No intake found for course enrollments</span>;
  }
  return (
    <Select
      disabled={disabled || loading}
      onValueChange={(value) => {
        const selectedEnrollment = enrollments.find(
          (item) => item.id === value
        );
        if (selectedEnrollment) {
          field.onChange(value);
          getItemOnValueChanges?.(selectedEnrollment);
        }
      }}
      value={field.value ?? undefined}
    >
      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <SelectValue placeholder="Select a Enrollments" />
      </SelectTrigger>
      <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        {enrollments?.map((enrollment) => (
          <SelectItem key={enrollment.id} value={enrollment.id} className="dark:hover:bg-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-bold dark:text-white">
                Enrolled Date: {enrollment.enrollment_date}
              </span>
              <span className="text-gray-500 text-sm dark:text-gray-400">
                (user: {enrollment.full_name})
              </span>
              <span className="text-gray-700 text-sm dark:text-gray-300">
                {new Date(
                  enrollment.enrollment_date as string
                ).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
              </span>
              {/* <Badge variant={intake.is_open ? 'default' : 'destructive'}>
                {intake.is_open ? 'Open' : 'Closed'}
              </Badge> */}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
