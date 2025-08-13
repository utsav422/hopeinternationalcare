// /components/Admin/Courses/CourseTable.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteCourse, useGetCourses } from '@/hooks/admin/courses';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
// import { Input } from '@/components/ui/input';
// import useDebounce from '@/hooks/use-debounce';
import type {
    ZodCourseSelectSchema,
    //   ZodInsertCourseType,
    ZodSelectCourseType,
} from '@/lib/db/drizzle-zod-schema/courses';
import { queryKeys } from '@/lib/query-keys';
import { generateIntakesForCourseAdvanced } from '@/lib/server-actions/admin/intakes';

// interface Props {
//   data: Array<ZodInsertCourseType & { category_name: string | null }>;
//   total: number;
// }

export default function CourseTable() {
    const queryState = useDataTableQueryState();
    const queryClient = useQueryClient();
    const { data: queryResult, error: _ } = useGetCourses({ ...queryState });

    const data = queryResult?.data as Array<
        typeof ZodCourseSelectSchema._zod.input & { category_name: string | null }
    >;
    const total = queryResult?.total ?? 0;

    const { mutateAsync: deleteCourse } = useDeleteCourse();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) {
            return;
        }

        await toast.promise(deleteCourse(id), {
            loading: 'Deleting course...',
            success: 'Course deleted successfully',
            error: 'Failed to delete course',
        });
    };
    const columns: ColumnDef<
        ZodSelectCourseType & { category_name: string | null }
    >[] = [
            {
                accessorKey: 'image_url',
                header: () => <div className="">Image</div>,
                cell: (cellProps) => {
                    return (
                        <div className="flex items-center justify-center">
                            <Image
                                alt={cellProps.row?.original?.title ?? 'some new one'}
                                height={100}
                                src={
                                    cellProps.row?.original.image_url &&
                                        cellProps.row?.original.image_url?.length > 0
                                        ? cellProps.row?.original.image_url?.trim()
                                        : 'https://placehold.co/100x200/?text=asdfa'
                                }
                                width={100}
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: 'title',
                header: () => <div className="">Title</div>,
                cell: ({ row }) => (
                    <div className="dark:text-gray-300">{row.getValue('title')}</div>
                ),
            },
            {
                accessorKey: 'level',
                header: () => <div className="">Level</div>,
                cell: ({ row }) => (
                    <div className="dark:text-gray-300">{row.getValue('level')}</div>
                ),
            },
            {
                accessorKey: 'duration_value',
                header: () => <div className="">Duration</div>,

                cell: (cellProps) => {
                    return (
                        <p className="flex items-center justify-center dark:text-gray-300">
                            {cellProps.row?.original.duration_value}
                        </p>
                    );
                },
            },
            {
                accessorKey: 'duration_type',
                header: () => <div className="">Duration Type</div>,

                cell: (cellProps) => {
                    return (
                        <p className="flex items-center justify-center dark:text-gray-300">
                            {cellProps.row?.original.duration_type}
                        </p>
                    );
                },
            },
            {
                accessorKey: 'category_name',
                header: () => <div className="">Category</div>,

                cell: (cellProps) => {
                    return (
                        <p className="flex items-center justify-center dark:text-gray-300">
                            {cellProps.row?.original.category_name}
                        </p>
                    );
                },
            },
            {
                accessorKey: 'created_at',
                header: () => <div className="">Created At</div>,

                cell: (cellProps) => {
                    return (
                        <p className="flex items-center justify-center dark:text-gray-300">
                            {cellProps.row?.original.created_at}
                        </p>
                    );
                },
            },
            {
                accessorKey: 'id',
                header: () => <div >Actions</div>,
                enableSorting: false,
                cell: (cellProps) => {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                            >
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/admin/courses/${cellProps?.row.original.slug}`}
                                    >
                                        View
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        className=""
                                        href={`/admin/courses/edit/${cellProps?.row.original.slug}`}
                                    >
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className=""
                                    onClick={async () => {
                                        const courseId = cellProps?.row.original.id;
                                        if (courseId) {
                                            await toast.promise(
                                                generateIntakesForCourseAdvanced(courseId),
                                                {
                                                    loading: 'Generating intakes...',
                                                    success: 'Intakes generated successfully',
                                                    error: 'Failed to generate intakes',
                                                }
                                            );
                                            queryClient.invalidateQueries({
                                                queryKey: queryKeys.intakes.all,
                                            });
                                        }
                                    }}
                                >
                                    Generate Intakes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 dark:text-red-500"
                                    onClick={() => handleDelete(cellProps?.row.original.id)}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    return (
        <Card >
            <CardHeader />
            <CardContent>
                <DataTable<
                    ZodSelectCourseType & { category_name: string | null },
                    unknown
                >
                    columns={columns}
                    data={data ?? []}
                    headerActionUrl="/admin/courses/new"
                    headerActionUrlLabel="Create New"
                    title="Courses Management"
                    total={total}
                />
            </CardContent>
        </Card>
    );
}
