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
import { useAdminCoursesAll } from '@/hooks/admin/courses';
import type { ZodSelectCourseType } from '@/lib/db/drizzle-zod-schema/courses';
import type { ZodInsertIntakeType } from '@/lib/db/drizzle-zod-schema/intakes';
import { Skeleton } from '../ui/skeleton';

type CourseForSelect = Omit<
    ZodSelectCourseType,
    'description' | 'created_at'
> & {
    category_name: string | null;
};

interface CourseSelectProps {
    field: ControllerRenderProps<ZodInsertIntakeType, 'course_id'>;
    disabled?: boolean;
}

export default function CourseSelect({ field, disabled }: CourseSelectProps) {
    const { isLoading, error, data: queryResult } = useAdminCoursesAll();
    const courses = queryResult?.data as CourseForSelect[] | undefined;

    if (error) {
        toast.error('Something went wrong while fetching categories', {
            description: error.message,
        });
    }
    if (isLoading) {
        return (
            <div className="flex items-center space-x-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        );
    }
    return (
        <Select
            disabled={disabled || isLoading}
            onValueChange={field.onChange}
            value={field.value ?? undefined}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent className="">
                {courses?.map((course: CourseForSelect) => (
                    <SelectItem
                        key={course.id}
                        value={course.id}
                    >
                        {course.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
