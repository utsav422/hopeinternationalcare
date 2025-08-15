'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { CourseCategoryBadge } from '@/components/Custom/course-category-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPublicCourseBySlug } from '@/hooks/admin/public-courses';
import type { ZodInsertCourseCategoryType } from '@/lib/db/drizzle-zod-schema/course-categories';
import type { ZodSelectCourseType } from '@/lib/db/drizzle-zod-schema/courses';
import { adminUpdateCourseCategoryIdCol } from '@/lib/server-actions/admin/courses';
import { adminUpsertCourseCategories } from '@/lib/server-actions/admin/courses-categories';
import CourseCategoryFormModal from './course-category-form-modal';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';



const CourseThumbnail = ({ src, alt }: { src: string; alt: string }) => (
    <Card className="flex items-center justify-center">
        <Image
            alt={alt || 'Course thumbnail'}
            className="rounded-md"
            height={200}
            width={300}
            src={src}
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
        <CardHeader>
            <CardTitle>
                <h1 className="mb-2 font-bold text-2xl ">Basic Information</h1>
            </CardTitle>
        </CardHeader>
        <CardContent>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-medium text-gray-500 text-sm ">
                        Title
                    </p>
                    <p className="dark:text-gray-300">{title}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-500 text-sm ">
                        Level
                    </p>
                    <p className="dark:text-gray-300">{level}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-500 text-sm ">
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
                            onClick={() => onCategoryAction(categoryId ? 'update' : 'add')}
                            variant="link"
                        >
                            {categoryId ? 'Change' : 'Add'}
                        </Button>
                    </div>
                </div>
                <div>
                    <p className="font-medium text-gray-500 text-sm ">
                        Slug
                    </p>
                    <p className="dark:text-gray-300">{slug}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-500 text-sm ">
                        Duration
                    </p>
                    <p className="dark:text-gray-300">
                        {durationValue} {durationType}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
);

const CoursePrice = ({ price }: { price: number }) => (
    <Card>
        <CardHeader>
            <CardTitle>
                Price
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="font-medium text-gray-500 text-sm ">
                NPR
            </p>
            <p className="font-bold text-3xl ">{price}</p>
        </CardContent>
    </Card>
);

const CourseIntakes = () => (
    <Card>
        <CardHeader>
            <CardTitle>
                Intakes
            </CardTitle>
        </CardHeader>
        <CardContent>

            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="border-b p-2 dark:border-gray-600 dark:text-gray-300">
                            Name
                        </th>
                        <th className="border-b p-2 dark:border-gray-600 dark:text-gray-300">
                            Start Date
                        </th>
                        <th className="border-b p-2 dark:border-gray-600 dark:text-gray-300">
                            End Date
                        </th>
                        <th className="border-b p-2 dark:border-gray-600 dark:text-gray-300">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td
                            className="p-4 text-center text-gray-500 "
                            colSpan={4}
                        >
                            No intakes available.
                        </td>
                    </tr>
                </tbody>
            </table>
        </CardContent>
        <CardFooter>

            <div className="mt-4 flex justify-end">
                <Button>
                    Generate Intakes
                </Button>
            </div>
        </CardFooter>
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

export default function CourseDetailsCard() {
    const params = useParams<{ slug: string }>();
    const { slug: slug_from_url } = params;
    const {
        isLoading,
        data: queryResult,
        error,
    } = useGetPublicCourseBySlug(slug_from_url);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const course = queryResult as ZodSelectCourseType | undefined;

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
                <CardContent>
                    <p className="text-center text-gray-500 ">
                        Course data is not available.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const handleCategoryAction = () => {
        setIsModalOpen(true);
    };

    const handleFormSubmit = (data: ZodInsertCourseCategoryType) => {
        toast.promise(adminUpsertCourseCategories(data), {
            loading: 'Saving category...',
            success: (response) => {
                if (response.success && response.data) {
                    adminUpdateCourseCategoryIdCol({
                        category_id: response.data.id,
                        id: course.id,
                    });
                    setIsModalOpen(false);
                    return 'Category saved successfully.';
                }
                throw new Error(response.error || 'Failed to save category.');
            },
            error: (err) => {
                return err.message || 'Failed to save category.';
            },
        });
    };

    const handleCategorySelect = (categoryId: string) => {
        toast.promise(
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
            <QueryErrorWrapper>
                <Suspense fallback={'loading...'}>
                    <CourseCategoryFormModal
                        isOpen={isModalOpen}
                        onCategorySelect={handleCategorySelect}
                        onSubmit={handleFormSubmit}
                        setIsOpen={setIsModalOpen}
                    />
                </Suspense>
            </QueryErrorWrapper>
        </>
    );
}
