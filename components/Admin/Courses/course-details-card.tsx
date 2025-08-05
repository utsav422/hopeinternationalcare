'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { CourseCategoryBadge } from '@/components/Custom/course-category-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPublicCourseBySlug } from '@/hooks/public-courses';
import { adminUpdateCourseCategoryIdCol } from '@/server-actions/admin/courses';
import { adminUpsertCourseCategories } from '@/server-actions/admin/courses-categories';
import type { ZTInsertCourseCategories } from '@/utils/db/drizzle-zod-schema/course-categories';
import type { ZodSelectCourseType } from '@/utils/db/drizzle-zod-schema/courses';
import CourseCategoryFormModal from './course-category-form-modal';

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

const CourseThumbnail = ({ src, alt }: { src: string; alt: string }) => (
  <Card className="flex items-center justify-center">
    <Image
      alt={alt}
      className="rounded-md"
      height={200}
      src={src}
      width={300}
    />
  </Card>
);

const CourseInfo = ({
  title,
  level,
  categoryId,
  slug,
  durationValue,
  durationType,
  onCategoryAction,
}: {
  title: string;
  level: number;
  categoryId: string | null;
  slug: string;
  durationValue: number;
  durationType: string;
  onCategoryAction: (action: 'add' | 'update') => void;
}) => (
  <Card>
    <h1 className="mb-2 font-bold text-2xl dark:text-white">{title}</h1>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="font-medium text-gray-500 text-sm dark:text-gray-400">
          Level
        </p>
        <p className="dark:text-gray-300">{level}</p>
      </div>
      <div>
        <p className="font-medium text-gray-500 text-sm dark:text-gray-400">
          Category ID
        </p>
        <div className="flex items-center space-x-2">
          <div>
            {categoryId ? (
              <CourseCategoryBadge categoryId={categoryId} />
            ) : (
              <p className="dark:text-gray-300">N/A</p>
            )}
          </div>
          <Button
            className="p-0 dark:text-blue-400"
            onClick={() => onCategoryAction(categoryId ? 'update' : 'add')}
            variant="link"
          >
            {categoryId ? 'Change' : 'Add'}
          </Button>
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-500 text-sm dark:text-gray-400">
          Slug
        </p>
        <p className="dark:text-gray-300">{slug}</p>
      </div>
      <div>
        <p className="font-medium text-gray-500 text-sm dark:text-gray-400">
          Duration
        </p>
        <p className="dark:text-gray-300">
          {durationValue} {durationType}
        </p>
      </div>
    </div>
  </Card>
);

const CoursePrice = ({ price }: { price: number }) => (
  <Card>
    <p className="font-medium text-gray-500 text-sm dark:text-gray-400">
      Price
    </p>
    <p className="font-bold text-3xl dark:text-white">${price}</p>
  </Card>
);

const CourseIntakes = () => (
  <Card>
    <h2 className="mb-4 font-bold text-xl dark:text-white">Intakes</h2>
    <table className="w-full text-left">
      <thead>
        <tr>
          <th className="border-b p-2 dark:text-gray-300 dark:border-gray-600">
            Name
          </th>
          <th className="border-b p-2 dark:text-gray-300 dark:border-gray-600">
            Start Date
          </th>
          <th className="border-b p-2 dark:text-gray-300 dark:border-gray-600">
            End Date
          </th>
          <th className="border-b p-2 dark:text-gray-300 dark:border-gray-600">
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            className="p-4 text-center text-gray-500 dark:text-gray-400"
            colSpan={4}
          >
            No intakes available.
          </td>
        </tr>
      </tbody>
    </table>
    <div className="mt-4 flex justify-end">
      <Button className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
        Generate Intakes
      </Button>
    </div>
  </Card>
);

const CourseDetailsSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="lg:col-span-1">
      <Skeleton className="h-[225px] w-full rounded-lg" />
    </div>
    <div className="space-y-6 lg:col-span-2">
      <Card>
        <Skeleton className="mb-4 h-8 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="mb-2 h-4 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </Card>
      <Card>
        <Skeleton className="mb-2 h-4 w-1/4" />
        <Skeleton className="h-10 w-1/3" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-6 w-1/4" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    </div>
  </div>
);

export default function CourseDetailsCard(props: { slug: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isLoading,
    data: queryResult,
    error,
  } = useGetPublicCourseBySlug(props.slug);
  const course = queryResult?.data as ZodSelectCourseType | undefined;

  if (isLoading) {
    return <CourseDetailsSkeleton />;
  }

  if (error) {
    toast.error('Error fetching course details', {
      description: error.message,
    });
  }
  if (!course) {
    return (
      <Card>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Course data is not available.
        </p>
      </Card>
    );
  }

  const handleCategoryAction = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: ZTInsertCourseCategories) => {
    await toast.promise(adminUpsertCourseCategories(data), {
      loading: 'Saving category...',
      success: (response) => {
        if (response.success) {
          if (response.data) {
            adminUpdateCourseCategoryIdCol({
              category_id: response.data.id,
              id: course.id,
            });
          }
          setIsModalOpen(false);
          return response.message || 'Category saved successfully.';
        }
        throw new Error(response.message || 'Failed to save category.');
      },
      error: (err) => {
        return err.message || 'Failed to save category.';
      },
    });
  };

  const handleCategorySelect = async (categoryId: string) => {
    await toast.promise(
      adminUpdateCourseCategoryIdCol({
        category_id: categoryId,
        id: course.id,
      }),
      {
        loading: 'Updating category...',
        success: 'Course category updated successfully.',
        error: (err) => {
          return err.message || 'Failed to update category.';
        },
      }
    );
  };

  const {
    image_url,
    title,
    level,
    category_id,
    slug,
    duration_value,
    duration_type,
    price,
  } = course;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {image_url && <CourseThumbnail alt={title} src={image_url} />}
        </div>
        <div className="space-y-6 lg:col-span-2">
          <CourseInfo
            categoryId={category_id}
            durationType={duration_type}
            durationValue={duration_value}
            level={level}
            onCategoryAction={handleCategoryAction}
            slug={slug}
            title={title}
          />
          <CoursePrice price={price} />
          <CourseIntakes />
        </div>
      </div>
      <CourseCategoryFormModal
        isOpen={isModalOpen}
        onCategorySelect={handleCategorySelect}
        onSubmit={handleFormSubmit}
        setIsOpen={setIsModalOpen}
      />
    </>
  );
}
