'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from 'use-debounce';
import CategoryFilter from '@/components/Custom/category-filter';
import CourseCard from '@/components/Custom/course-card';
import { CourseCardSkeleton } from '@/components/Custom/course-card-skeleton';
import IntakeFilter from '@/components/Custom/intake-filter';
import SortingSelect from '@/components/Custom/sorting-select';
import { UpcomingIntakesBanner } from '@/components/Custom/upcoming-intakes-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetPublicCourses } from '@/lib/hooks/public/courses-optimized';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Search, Filter, RotateCcw } from 'lucide-react';

export function AllCourses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [filters, setFilters] = useState({
        intake_date: '',
        category: '',
    });
    const [sorting, setSorting] = useState('created_at-desc');
    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    const [sortBy, sortOrder] = sorting.split('-');

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isLoading,
    } = useGetPublicCourses({
        pageSize: 9,
        filters: { ...filters, title: debouncedSearchTerm },
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
    });

    // Track if we're currently fetching to prevent multiple requests
    const [isFetching, setIsFetching] = useState(false);

    // Handle fetch with protection against multiple simultaneous requests
    const handleFetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetching && !isFetchingNextPage) {
            setIsFetching(true);
            fetchNextPage().finally(() => {
                setIsFetching(false);
            });
        }
    }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

    // Only trigger fetch when in view if we're not already fetching
    useEffect(() => {
        if (inView && hasNextPage && !isFetching && !isFetchingNextPage) {
            handleFetchNextPage();
        }
    }, [
        inView,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        handleFetchNextPage,
    ]);

    const courses = useMemo(() => {
        return data?.pages.flatMap(page => page.data?.data) ?? [];
    }, [data]);

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            intake_date: '',
            category: '',
        });
        setSorting('created_at-desc');
    };

    const hasActiveFilters = useMemo(() => {
        return (
            searchTerm !== '' ||
            filters.intake_date !== '' ||
            filters.category !== '' ||
            sorting !== 'created_at-desc'
        );
    }, [searchTerm, filters, sorting]);

    const renderSkeletons = () => {
        return [1, 2, 3, 4, 5, 6].map((_, index) => (
            <CourseCardSkeleton key={`skeleton-${index}`} />
        ));
    };

    const getButtonText = () => {
        if (isFetchingNextPage || isFetching) {
            return (
                <div className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    <span className="ml-2">Loading more...</span>
                </div>
            );
        }
        if (hasNextPage) {
            return 'Load More';
        }
        return 'Nothing more to load';
    };

    const renderContent = () => {
        if (status === 'pending') {
            return (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {renderSkeletons()}
                </div>
            );
        }

        if (status === 'error') {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                            <svg
                                className="h-8 w-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.33.192 3 1.732 3z"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Error loading courses
                        </h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            {error?.message ||
                                'Something went wrong. Please try again.'}
                        </p>
                        <div className="mt-6">
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-70"
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (courses.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <svg
                                className="h-8 w-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            No courses found
                        </h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            {hasActiveFilters
                                ? 'No courses match your current filters. Try adjusting your search or filters.'
                                : 'No courses are currently available. Please check back later.'}
                        </p>
                        {hasActiveFilters && (
                            <div className="mt-6">
                                <Button
                                    onClick={handleResetFilters}
                                    className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="pt-4">
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-semibold">{courses.length}</span>{' '}
                        course
                        {courses.length !== 1 ? 's' : ''}
                        {hasActiveFilters && (
                            <span>
                                {' '}
                                matching your search
                                {searchTerm && ` for "${searchTerm}"`}
                            </span>
                        )}
                    </p>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                            className="flex items-center"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset Filters
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {courses?.map(course => (
                        <CourseCard
                            available_seats={course?.available_seats ?? null}
                            categoryName={course?.categoryName ?? null}
                            overview={course?.course_overview || ''}
                            highlights={course?.course_highlights || ''}
                            image_url={course?.image_url || ''}
                            id={course?.id ?? ''}
                            key={course?.id}
                            next_intake_date={course?.next_intake_date ?? null}
                            next_intake_id={course?.next_intake_id ?? null}
                            price={course?.price ?? Number.NaN}
                            slug={course?.slug ?? ''}
                            title={course?.title ?? ''}
                        />
                    ))}
                </div>
                {hasNextPage && (
                    <div className="mt-12 text-center">
                        <Button
                            className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                            disabled={
                                !hasNextPage || isFetchingNextPage || isFetching
                            }
                            onClick={handleFetchNextPage}
                            ref={ref}
                            size="lg"
                        >
                            {getButtonText()}
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 lg:py-12">
                <Suspense fallback={'loading....'}>
                    <UpcomingIntakesBanner />
                </Suspense>
                <header className="my-8 text-center">
                    <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl">
                        Explore Our Courses
                    </h1>
                    <p className="mt-4 text-gray-600 text-lg">
                        Find the perfect course to kickstart your career in aged
                        care.
                    </p>
                </header>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full rounded-lg bg-white p-6 shadow-lg lg:sticky lg:top-24 lg:w-1/4 dark:bg-gray-800">
                        <div className="space-y-8">
                            <div>
                                <div className="mb-4 flex items-center">
                                    <Search className="mr-2 h-5 w-5 text-gray-500" />
                                    <h2 className="font-semibold text-xl text-gray-800">
                                        Search
                                    </h2>
                                </div>
                                <div className="relative">
                                    <Input
                                        className="rounded-lg border-gray-30 bg-gray-50 text-base dark:border-gray-600 dark:bg-gray-700 pl-10"
                                        name="title"
                                        onChange={e =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder="Search courses..."
                                        value={searchTerm}
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <div className="mb-4 flex items-center">
                                    <Filter className="mr-2 h-5 w-5 text-gray-500" />
                                    <h2 className="font-semibold text-xl text-gray-800">
                                        Filters
                                    </h2>
                                </div>
                                <div className="space-y-6">
                                    <QueryErrorWrapper>
                                        <Suspense fallback={'loading...'}>
                                            <IntakeFilter
                                                onChange={value =>
                                                    handleFilterChange(
                                                        'intake_date',
                                                        value
                                                    )
                                                }
                                                value={filters.intake_date}
                                            />
                                        </Suspense>
                                    </QueryErrorWrapper>
                                    <QueryErrorWrapper>
                                        <Suspense fallback={'loading...'}>
                                            <CategoryFilter
                                                onChange={value =>
                                                    handleFilterChange(
                                                        'category',
                                                        value
                                                    )
                                                }
                                                value={filters.category}
                                            />
                                        </Suspense>
                                    </QueryErrorWrapper>
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-4 font-semibold text-xl text-gray-800">
                                    Sort By
                                </h2>
                                <SortingSelect
                                    onChange={setSorting}
                                    value={sorting}
                                />
                            </div>
                        </div>
                    </aside>

                    <main className="w-full lg:w-3/4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-teal-500"></div>
                                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                    Loading courses...
                                </p>
                            </div>
                        ) : (
                            renderContent()
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
