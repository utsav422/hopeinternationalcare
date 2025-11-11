'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, DollarSign, Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ZodSelectCourseType } from '@/lib/db/drizzle-zod-schema/courses';

interface CoursePreviewCardProps {
    course: ZodSelectCourseType & {
        category?: { name: string } | null;
    };
    variant?: 'grid' | 'list';
    showActions?: boolean;
    className?: string;
}

export function CoursePreviewCard({
    course,
    variant = 'grid',
    showActions = true,
    className,
}: CoursePreviewCardProps) {
    const {
        id,
        title,
        courseHighlights,
        courseOverview,
        image_url,
        price,
        level,
        duration_value,
        duration_type,
        slug,
        category,
    } = course;

    const formatPrice = (price: number | null) => {
        if (price === null || price === 0) return 'Free';
        return `$${price.toLocaleString()}`;
    };

    if (variant === 'list') {
        return (
            <Card
                className={cn('hover:shadow-md transition-shadow', className)}
            >
                <CardContent className="p-6">
                    <div className="flex gap-6">
                        {/* Image */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-24 relative overflow-hidden rounded-lg bg-muted">
                                {image_url ? (
                                    <Image
                                        src={image_url}
                                        alt={title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1">
                                    {title}
                                </h3>
                                {category && (
                                    <p className="text-sm text-muted-foreground">
                                        {category.name}
                                    </p>
                                )}
                            </div>

                            <pre>
                                {JSON.stringify(courseHighlights, null, 2)}
                            </pre>
                            <pre>{JSON.stringify(courseOverview, null, 2)}</pre>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {level && (
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        Level {level}
                                    </span>
                                )}
                                {duration_value && duration_type && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {duration_value} {duration_type}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 font-medium text-primary">
                                    <DollarSign className="h-3 w-3" />
                                    {formatPrice(price)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        {showActions && (
                            <div className="flex-shrink-0 flex flex-col gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/courses/${slug}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </Link>
                                </Button>
                                <Button asChild variant="default" size="sm">
                                    <Link href={`/admin/courses/${id}`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Grid variant
    return (
        <Card
            className={cn('hover:shadow-lg transition-shadow group', className)}
        >
            {/* Image */}
            <div className="aspect-video relative overflow-hidden bg-muted">
                {image_url ? (
                    <Image
                        src={image_url}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}

                {/* Price Badge */}
                <div className="absolute top-3 right-3">
                    <Badge
                        variant={
                            price === null || price === 0
                                ? 'secondary'
                                : 'default'
                        }
                    >
                        {formatPrice(price)}
                    </Badge>
                </div>
            </div>

            <CardHeader className="pb-3">
                <div className="space-y-2">
                    <CardTitle className="line-clamp-2 text-lg">
                        {title}
                    </CardTitle>
                    {category && (
                        <CardDescription>{category.name}</CardDescription>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
                {/* Description */}
                <pre>{JSON.stringify(courseHighlights, null, 2)}</pre>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                    {level && (
                        <Badge variant="outline" className="text-xs">
                            Level {level}
                        </Badge>
                    )}
                    {duration_value && duration_type && (
                        <Badge
                            variant="outline"
                            className="text-xs flex items-center gap-1"
                        >
                            <Clock className="h-3 w-3" />
                            {duration_value} {duration_type}
                        </Badge>
                    )}
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-2 pt-2">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <Link href={`/courses/${slug}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="flex-1"
                        >
                            <Link href={`/admin/courses/${id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Course Grid Component for Admin
 */
interface CourseGridProps {
    courses: (ZodSelectCourseType & {
        category?: { name: string } | null;
    })[];
    columns?: 1 | 2 | 3 | 4;
    variant?: 'grid' | 'list';
    showActions?: boolean;
    className?: string;
}

export function AdminCourseGrid({
    courses,
    columns = 3,
    variant = 'grid',
    showActions = true,
    className,
}: CourseGridProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    };

    if (variant === 'list') {
        return (
            <div className={cn('space-y-4', className)}>
                {courses.map(course => (
                    <CoursePreviewCard
                        key={course.id}
                        course={course}
                        variant="list"
                        showActions={showActions}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={cn('grid gap-6', gridCols[columns], className)}>
            {courses.map(course => (
                <CoursePreviewCard
                    key={course.id}
                    course={course}
                    variant="grid"
                    showActions={showActions}
                />
            ))}
        </div>
    );
}

/**
 * Featured Course Component for Admin Dashboard
 */
export function AdminFeaturedCourse({
    course,
    className,
}: {
    course: ZodSelectCourseType & {
        category?: { name: string } | null;
    };
    className?: string;
}) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <div className="md:flex">
                <div className="md:w-1/3">
                    <div className="aspect-video md:aspect-square relative bg-muted">
                        {course.image_url ? (
                            <Image
                                src={course.image_url}
                                alt={course.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="md:w-2/3 p-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold">
                                {course.title}
                            </h3>
                            {course.category && (
                                <p className="text-muted-foreground">
                                    {course.category.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div>
                                <h4 className="font-medium">
                                    Course Highlights:
                                </h4>
                                <p className="whitespace-pre-wrap">
                                    {course.courseHighlights ||
                                        'No highlights provided.'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium">
                                    Course Overview:
                                </h4>
                                <p className="whitespace-pre-wrap">
                                    {course.courseOverview ||
                                        'No overview provided.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {course.level && (
                                <Badge variant="outline">
                                    Level {course.level}
                                </Badge>
                            )}
                            {course.duration_value && course.duration_type && (
                                <Badge
                                    variant="outline"
                                    className="flex items-center gap-1"
                                >
                                    <Clock className="h-3 w-3" />
                                    {course.duration_value}{' '}
                                    {course.duration_type}
                                </Badge>
                            )}
                            <Badge variant="default">
                                {course.price === null || course.price === 0
                                    ? 'Free'
                                    : `$${course.price}`}
                            </Badge>
                        </div>

                        <div className="flex gap-3">
                            <Button asChild variant="outline">
                                <Link href={`/courses/${course.slug}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Course
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/admin/courses/${course.id}`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Course
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
