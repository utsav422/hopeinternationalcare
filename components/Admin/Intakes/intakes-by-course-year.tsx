'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminIntakesByCourseAndYear } from '@/hooks/admin/intakes';
import { format } from 'date-fns';

interface IntakesByCourseYearProps {
    initialCourseId?: string;
    initialYear?: string;
}

export default function IntakesByCourseYear({
    initialCourseId = '',
    initialYear = new Date().getFullYear().toString()
}: IntakesByCourseYearProps) {
    const [courseId, setCourseId] = useState(initialCourseId);
    const [year, setYear] = useState(initialYear);
    const [searchParams, setSearchParams] = useState({ courseId: initialCourseId, year: initialYear });

    const { data: result, isLoading, error, refetch } = useAdminIntakesByCourseAndYear(
        searchParams.courseId,
        searchParams.year
    );

    const handleSearch = () => {
        // Basic validation
        if (!courseId.trim()) {
            return;
        }

        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum) || year.length !== 4 || yearNum < 1900 || yearNum > 2100) {
            return;
        }

        setSearchParams({ courseId: courseId.trim(), year });
    };

    const handleReset = () => {
        const currentYear = new Date().getFullYear().toString();
        setCourseId('');
        setYear(currentYear);
        setSearchParams({ courseId: '', year: '' });
    };

    return (
        <div className="space-y-6">
            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Intakes by Course and Year</CardTitle>
                    <CardDescription>
                        Enter a course ID and year to view all intakes for that period
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="courseId">Course ID</Label>
                            <Input
                                id="courseId"
                                placeholder="Enter course UUID"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Year</Label>
                            <Input
                                id="year"
                                placeholder="e.g., 2024"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end space-x-2">
                            <Button
                                onClick={handleSearch}
                                disabled={
                                    !courseId.trim() ||
                                    !year ||
                                    year.length !== 4 ||
                                    isNaN(parseInt(year, 10))
                                }
                            >
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {!searchParams.courseId && !searchParams.year && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <p>Enter a course ID and year above to search for intakes.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading && searchParams.courseId && searchParams.year && (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && searchParams.courseId && searchParams.year && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600">
                            <p>Error: {error.message}</p>
                            <Button variant="outline" onClick={() => refetch()} className="mt-2">
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && !result.success && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600">
                            <p>Error: {result.error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && result.success && result.metadata && result.data && (
                <div className="space-y-4">
                    {/* Statistics Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{result.metadata.courseTitle}</CardTitle>
                            <CardDescription>
                                Intakes for {result.metadata.year}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{result.metadata.totalIntakes}</div>
                                    <div className="text-sm text-muted-foreground">Total Intakes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{result.metadata.openIntakes}</div>
                                    <div className="text-sm text-muted-foreground">Open</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{result.metadata.totalRegistered}</div>
                                    <div className="text-sm text-muted-foreground">Registered</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{result.metadata.utilizationRate}%</div>
                                    <div className="text-sm text-muted-foreground">Utilization</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Intakes List */}
                    {result.data.length > 0 ? (
                        <div className="grid gap-4">
                            {result.data.map((intake) => (
                                <Card key={intake.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold">
                                                        {format(new Date(intake.start_date), 'MMM dd, yyyy')} - {format(new Date(intake.end_date), 'MMM dd, yyyy')}
                                                    </h3>
                                                    <Badge variant={intake.is_open ? 'default' : 'secondary'}>
                                                        {intake.is_open ? 'Open' : 'Closed'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Capacity: {intake.total_registered}/{intake.capacity}
                                                    ({intake.capacity - intake.total_registered} available)
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">${intake.coursePrice}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {Math.round((intake.total_registered / intake.capacity) * 100)}% full
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center text-muted-foreground">
                                    <p>No intakes found for {result.metadata.courseTitle} in {result.metadata.year}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
