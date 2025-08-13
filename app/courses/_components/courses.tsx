'use client';

import { Suspense, useEffect, useState } from 'react';
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
import { useGetPublicCourses } from '@/hooks/admin/public-courses';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

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

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const courses = data?.pages.flatMap((page) => page.data) ?? [];

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
    };

    const renderSkeletons = () => {
        return [1, 2, 3].map((_) => <CourseCardSkeleton key={_} />);
    };

    const getButtonText = () => {
        if (isFetchingNextPage) {
            return 'Loading more...';
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
                <div className="text-center text-red-500">Error: {error.message}</div>
            );
        }

        return (
            <div className="pt-20">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {courses?.map((course) => (
                        <CourseCard
                            available_seats={course?.available_seats ?? null}
                            categoryName={course?.categoryName ?? null}
                            desc={course?.description || ''}
                            heading={course?.image_url || ''}
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
                <div className="mt-8 text-center">
                    <Button
                        className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                        disabled={!hasNextPage || isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                        ref={ref}
                    >
                        {getButtonText()}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <Suspense fallback={'loading....'}>
                    <UpcomingIntakesBanner />
                </Suspense>
                <header className="my-12 text-center">
                    <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl ">
                        Explore Our Courses
                    </h1>
                    <p className="mt-4 text-gray-600 text-lg ">
                        Find the perfect course to kickstart your career in aged care.
                    </p>
                </header>
                <div className="flex flex-col gap-10 lg:flex-row">
                    <aside className="w-full self-start rounded-lg bg-white p-6 shadow-lg lg:sticky lg:top-24 lg:w-1/4 dark:bg-gray-800">
                        <div className="space-y-8">
                            <div>
                                <h2 className="mb-4 font-semibold text-2xl text-gray-800 ">
                                    Search
                                </h2>
                                <Input
                                    className="rounded-lg border-gray-300 bg-gray-50 text-base dark:border-gray-600 dark:bg-gray-700 "
                                    name="title"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by title..."
                                    value={searchTerm}
                                />
                            </div>
                            <div>
                                <h2 className="mb-4 font-semibold text-2xl text-gray-800 ">
                                    Filters
                                </h2>
                                <div className="space-y-4">
                                    <QueryErrorWrapper>

                                        <Suspense fallback={'loading...'}>
                                            <IntakeFilter
                                                onChange={(value) =>
                                                    handleFilterChange('intake_date', value)
                                                }
                                                value={filters.intake_date}
                                            />
                                        </Suspense>
                                    </QueryErrorWrapper>
                                    <QueryErrorWrapper>
                                        <Suspense fallback={'loading...'}>
                                            <CategoryFilter
                                                onChange={(value) =>
                                                    handleFilterChange('category', value)
                                                }
                                                value={filters.category}
                                            />
                                        </Suspense>
                                    </QueryErrorWrapper>
                                </div>
                            </div>
                            <div>
                                <h2 className="mb-4 font-semibold text-2xl text-gray-800 ">
                                    Sort By
                                </h2>
                                <SortingSelect onChange={setSorting} value={sorting} />
                            </div>
                        </div>
                    </aside>

                    <main className="w-full lg:w-3/4">{isLoading ? "Loading content..." : renderContent()}</main>
                </div>
            </div>
        </div>
    );
}
