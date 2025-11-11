'use client';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock } from 'lucide-react';

export function CourseContentSkeleton() {
    return (
        <div className="animate-pulse">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="mt-8 space-y-4">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
            </div>
        </div>
    );
}

interface CourseContentProps {
    image_url: string;
    title: string;
    overview: string;
    highlights: string;
    level?: number;
    duration_value?: number;
    duration_type?: string;
    category?: string;
}

export function CourseContent({
    image_url,
    title,
    overview,
    highlights,
    level,
    duration_value,
    duration_type,
    category,
}: CourseContentProps) {
    return (
        <div className="space-y-8">
            {/* Course Image */}
            <div className="overflow-hidden rounded-lg shadow-lg">
                <Image
                    unoptimized={true}
                    alt={title}
                    className="h-auto w-full object-cover"
                    height={500}
                    src={image_url}
                    width={800}
                />
            </div>

            {/* Course Metadata */}
            {(level || duration_value || category) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Course Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {category && (
                                <Badge variant="secondary" className="text-sm">
                                    {category}
                                </Badge>
                            )}
                            {level && (
                                <Badge variant="outline" className="text-sm">
                                    Level {level}
                                </Badge>
                            )}
                            {duration_value && duration_type && (
                                <Badge
                                    variant="outline"
                                    className="text-sm flex items-center gap-1"
                                >
                                    <Clock className="h-3 w-3" />
                                    {duration_value} {duration_type}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Course Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Overview of tis Course</CardTitle>
                </CardHeader>
                <CardContent>{overview}</CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Highlights of tis Course</CardTitle>
                </CardHeader>
                <CardContent>{highlights}</CardContent>
            </Card>
        </div>
    );
}
