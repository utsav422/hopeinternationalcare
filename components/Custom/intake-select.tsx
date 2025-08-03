'use client';

import { useEffect, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  adminGetAllIntake,
  type IntakeWithCourseTitleWithPrice,
} from '@/server-actions/admin/intakes';
import type { ZodInsertEnrollmentType } from '@/utils/db/drizzle-zod-schema/enrollment';

interface IntakeSelectProps {
  field: ControllerRenderProps<ZodInsertEnrollmentType, 'intake_id'>;
  disabled?: boolean;
  getItemOnValueChanges?: (item: IntakeWithCourseTitleWithPrice) => void;
}

export default function IntakeSelect({
  field,
  disabled,
  getItemOnValueChanges,
}: IntakeSelectProps) {
  const [intakes, setIntakes] = useState<IntakeWithCourseTitleWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await adminGetAllIntake();
        setIntakes(
          data?.filter(
            (item) => item.is_open
          ) as IntakeWithCourseTitleWithPrice[]
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
  if (intakes.length === 0) {
    return <span>No intake found for course enrollments</span>;
  }
  return (
    <Select
      disabled={disabled || loading}
      onValueChange={(value) => {
        const selectedIntakes = intakes.find((item) => item.id === value);
        if (selectedIntakes) {
          field.onChange(value);
          getItemOnValueChanges?.(selectedIntakes);
        }
      }}
      value={field.value ?? undefined}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a intake" />
      </SelectTrigger>
      <SelectContent>
        {intakes.map((intake) => (
          <SelectItem key={intake.id} value={intake.id}>
            <div className="flex items-center gap-2">
              <span className="font-bold">{intake.courseTitle}</span>
              <span className="text-gray-500 text-sm">
                (Capacity: {intake.capacity})
              </span>
              <span className="text-gray-700 text-sm">
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
              <Badge variant={intake.is_open ? 'default' : 'destructive'}>
                {intake.is_open ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
