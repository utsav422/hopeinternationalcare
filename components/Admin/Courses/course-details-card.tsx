'use client';

import Image from "next/image";
import { useParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { CourseCategoryBadge } from '@/components/Custom/course-category-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ZodInsertCourseCategoryType } from '@/lib/db/drizzle-zod-schema/course-categories';
import type { ZodSelectCourseType, ZodSelectCourseWithRelationsType } from '@/lib/db/drizzle-zod-schema/courses';
import { adminCourseUpdateCategoryId } from '@/lib/server-actions/admin/courses';
import { adminCourseCategoryUpsert } from '@/lib/server-actions/admin/course-categories';
import CourseCategoryFormModal from './course-category-form-modal';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuspenseAdminCourseById } from '@/hooks/admin/courses';
import { useAdminIntakesByCourseAndYear, useGenerateIntakesForCourseAdvanced } from '@/hooks/admin/intakes';
import IntakesByCourseYear from '@/components/Admin/Intakes/intakes-by-course-year';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { BookOpen } from 'lucide-react';
import { User } from "@supabase/supabase-js";


const CourseThumbnail = ({ src, alt }: { src: string; alt: string }) => (
    <Card className="flex items-center justify-center">
        <Image unoptimized={true}
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
    affiliationName,
    onCategoryAction,
}: {
    title: string;
    level: number;
    categoryId: string | null;
    slug: string;
    durationValue: number;
    durationType: string;
    affiliationName?: string | null;
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
                        Affiliation
                    </p>
                    <p className="dark:text-gray-300">{affiliationName ?? 'N/A'}</p>
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

const CourseIntakesOverview = () => {
    const { id } = useParams<{ id: string }>();
    const currentYear = new Date().getFullYear().toString();
    const { data: result, isLoading, error, refetch } = useAdminIntakesByCourseAndYear(id, currentYear);
    const { mutateAsync: generateIntakes, isPending: isGenerating } = useGenerateIntakesForCourseAdvanced();

    const handleGenerateIntakes = async () => {
        try {
            const result = await generateIntakes(id);
            if (result.success) {
                toast.success(result.message || 'Intakes generated successfully');
                refetch(); // Refresh the data
            } else {
                toast.error(result.error || 'Failed to generate intakes');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to generate intakes');
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Current Year Intakes ({currentYear})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Current Year Intakes ({currentYear})</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">Error loading intakes: {error.message}</p>
                </CardContent>
            </Card>
        );
    }

    if (!result?.success) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Current Year Intakes ({currentYear})</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">Error: {result?.error}</p>
                </CardContent>
            </Card>
        );
    }

    const { data: intakes, metadata } = result;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Current Year Intakes ({currentYear})</span>
                    {metadata && (
                        <Badge variant="secondary">
                            {metadata.totalIntakes} intake{metadata.totalIntakes !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {metadata && (
                    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-lg font-semibold">{metadata.totalIntakes}</div>
                            <div className="text-sm text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{metadata.openIntakes}</div>
                            <div className="text-sm text-muted-foreground">Open</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold">{metadata.totalRegistered}</div>
                            <div className="text-sm text-muted-foreground">Registered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold">{metadata.utilizationRate}%</div>
                            <div className="text-sm text-muted-foreground">Utilization</div>
                        </div>
                    </div>
                )}

                {intakes && intakes.length > 0 ? (
                    <div className="space-y-3">
                        {intakes.slice(0, 3).map((intake) => (
                            <div key={intake.id} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">
                                        {format(new Date(intake.start_date), 'MMM dd, yyyy')} - {format(new Date(intake.end_date), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {intake.total_registered}/{intake.capacity} registered
                                    </div>
                                </div>
                                <Badge variant={intake.is_open ? 'default' : 'secondary'}>
                                    {intake.is_open ? 'Open' : 'Closed'}
                                </Badge>
                            </div>
                        ))}
                        {intakes.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center">
                                And {intakes.length - 3} more intake{intakes.length - 3 !== 1 ? 's' : ''}...
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">
                            No intakes available for {currentYear}
                        </p>
                        <Button
                            onClick={handleGenerateIntakes}
                            disabled={isGenerating}
                            variant="outline"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Intakes'}
                        </Button>
                    </div>
                )}
            </CardContent>
            {intakes && intakes.length > 0 && (
                <div className="px-6 pb-6">
                    <Button
                        onClick={handleGenerateIntakes}
                        disabled={isGenerating}
                        variant="outline"
                        size="sm"
                        className="w-full"
                    >
                        {isGenerating ? 'Generating...' : 'Generate More Intakes'}
                    </Button>
                </div>
            )}
        </Card>
    );
};

const CourseIntakesDetailed = () => {
    const { id } = useParams<{ id: string }>();
    const currentYear = new Date().getFullYear().toString();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Intake Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="detailed">Detailed Search</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                        <CourseIntakesOverview />
                    </TabsContent>
                    <TabsContent value="detailed" className="mt-4">
                        <IntakesByCourseYear
                            initialCourseId={id}
                            initialYear={currentYear}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};


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
    const params = useParams<{ id: string }>();
    const { id: id_from_url } = params;
    const { id } = useParams<{ id: string }>();
    const {
        isLoading,
        error,
        data: queryResult,
    } = useSuspenseAdminCourseById(id ?? '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // @ts-ignore - affiliation_name is added by the query but not in the type
    const course = queryResult?.data;
    // @ts-ignore - affiliation_name is added by the query but not in the type
    const { affiliation_name } = course || {};

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
        toast.promise(adminCourseCategoryUpsert(data), {
            loading: 'Saving category...',
            success: (response) => {
                if (response.success && response.data) {
                    adminCourseUpdateCategoryId({
                        category_id: (response?.data as never as User)?.id,
                        id: course.id,
                    }).catch(console.log)
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
            adminCourseUpdateCategoryId({
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
        courseHighlights,
        courseOverview,
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
                        affiliationName={affiliation_name ?? null}
                        categoryId={category_id}
                        durationType={duration_type}
                        durationValue={duration_value}
                        level={level}
                        onCategoryAction={handleCategoryAction}
                        slug={slug}
                        title={title}
                    />
                    <CoursePrice price={price} />

                </div>
                <div className="col-span-12">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Course Description
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        Admin View
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        Read-only
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-lg">Course Highlights</h3>
                                    <p className="whitespace-pre-wrap">{courseHighlights || 'No highlights provided.'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-lg">Course Overview</h3>
                                    <p className="whitespace-pre-wrap">{courseOverview || 'No overview provided.'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-12">
                    <QueryErrorWrapper>
                        <Suspense>
                            <CourseIntakesDetailed />
                        </Suspense>
                    </QueryErrorWrapper>
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
