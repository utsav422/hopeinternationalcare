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
  <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
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
    <h1 className="mb-2 font-bold text-2xl">{title}</h1>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="font-medium text-gray-500 text-sm">Level</p>
        <p>{level}</p>
      </div>
      <div>
        <p className="font-medium text-gray-500 text-sm">Category ID</p>
        <div className="flex items-center space-x-2">
          <div>
            {categoryId ? (
              <CourseCategoryBadge categoryId={categoryId} />
            ) : (
              <p>N/A</p>
            )}
          </div>
          <Button
            className="p-0"
            onClick={() => onCategoryAction(categoryId ? 'update' : 'add')}
            variant="link"
          >
            {categoryId ? 'Change' : 'Add'}
          </Button>
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-500 text-sm">Slug</p>
        <p>{slug}</p>
      </div>
      <div>
        <p className="font-medium text-gray-500 text-sm">Duration</p>
        <p>
          {durationValue} {durationType}
        </p>
      </div>
    </div>
  </Card>
);

const CoursePrice = ({ price }: { price: number }) => (
  <Card>
    <p className="font-medium text-gray-500 text-sm">Price</p>
    <p className="font-bold text-3xl">${price}</p>
  </Card>
);

const CourseIntakes = () => (
  <Card>
    <h2 className="mb-4 font-bold text-xl">Intakes</h2>
    <table className="w-full text-left">
      <thead>
        <tr>
          <th className="border-b p-2">Name</th>
          <th className="border-b p-2">Start Date</th>
          <th className="border-b p-2">End Date</th>
          <th className="border-b p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-4 text-center text-gray-500" colSpan={4}>
            No intakes available.
          </td>
        </tr>
      </tbody>
    </table>
    <div className="mt-4 flex justify-end">
      <Button>Generate Intakes</Button>
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
        <p className="text-center text-gray-500">
          Course data is not available.
        </p>
      </Card>
    );
  }

  const handleCategoryAction = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: ZTInsertCourseCategories) => {
    try {
      const response = await adminUpsertCourseCategories(data);

      if (response.success) {
        if (response.message) {
          toast.success(response.message);
        }

        if (response.data) {
          await adminUpdateCourseCategoryIdCol({
            category_id: response.data.id,
            id: course.id,
          });
        }

        setIsModalOpen(false);
      } else {
        const errorMessage =
          ('errors' in response && response.errors) ||
          ('message' in response && response.message) ||
          'An unknown error occurred.';
        toast.error(errorMessage as string);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === 'string') {
        toast.error(error);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    try {
      await adminUpdateCourseCategoryIdCol({
        category_id: categoryId,
        id: course.id,
      });
      toast.success('Course category updated successfully.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          'An unexpected error occurred while updating the category.'
        );
      }
    }
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
