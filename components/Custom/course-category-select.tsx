'use client';

import { useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllCourseCategories } from '@/hooks/admin/course-categories';
import type { ZodInsertCourseCategoryType } from '@/lib/db/drizzle-zod-schema/course-categories';
import type { ZodInsertCourseType } from '@/lib/db/drizzle-zod-schema/courses';
import { adminUpsertCourseCategories } from '@/lib/server-actions/admin/courses-categories';
import CourseCategoryFormModal from '../Admin/Courses/course-category-form-modal';
import { Button } from '../ui/button';
import { FormControl } from '../ui/form';
import { Skeleton } from '../ui/skeleton';

interface CourseCategorySelectProps {
  field: ControllerRenderProps<ZodInsertCourseType, 'category_id'>;
  disabled?: boolean;
}

export default function CourseCategorySelect({
  field,
  disabled,
}: CourseCategorySelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: queryResult,
    isLoading,
    error: queryError,
    refetch,
  } = useGetAllCourseCategories();
  if (queryError) {
    toast.error('Something went wrong while fetching categories', {
      description: queryError.message,
    });
  }
  const categories = queryResult?.data ?? [];

  const handleCreateCategory = async (data: ZodInsertCourseCategoryType) => {
    try {
      const result = await adminUpsertCourseCategories(data);
      if (result.success) {
        toast.success('Category created successfully');
        refetch();
        setIsModalOpen(false);
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

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

  if (categories?.length === 0) {
    return (
      <div className="dark:text-white">
        <p>No categories found.</p>
        <Button
          className="dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          Create Category
        </Button>
        <CourseCategoryFormModal
          creationOnly
          isOpen={isModalOpen}
          onSubmit={handleCreateCategory}
          setIsOpen={setIsModalOpen}
        />
      </div>
    );
  }

  return (
    <FormControl>
      <Select
        disabled={disabled}
        onValueChange={field.onChange}
        value={field?.value ?? undefined}
      >
        <SelectTrigger className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          {categories.map((category) => (
            <SelectItem
              className="dark:hover:bg-gray-700"
              key={category.id}
              value={category.id}
            >
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormControl>
  );
}
