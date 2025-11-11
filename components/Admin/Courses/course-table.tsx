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
import {
    useAdminCourseDelete,
    useAdminCourses,
} from '@/lib/hooks/admin/courses-optimized';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
// import { Input } from '@/components/ui/input';
// import useDebounce from '@/hooks/use-debounce';
import type { CourseListItem } from '@/lib/types/courses';
import { queryKeys } from '@/lib/query-keys';
import { adminIntakeGenerateForCourseAdvanced } from '@/lib/server-actions/admin/intakes-optimized';

// interface Props {
//   data: Array<ZodInsertCourseType & { category_name: string | null }>;
//   total: number;
// }

export default function CourseTable() {
    const queryState = useDataTableQueryState();
    const queryClient = useQueryClient();
    const { data: queryResult, error } = useAdminCourses({ ...queryState });

    const data = queryResult?.data?.data as CourseListItem[];
    const total = queryResult?.data?.total ?? 0;

    const { mutateAsync: deleteCourse } = useAdminCourseDelete();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) {
            return;
        }

        toast.promise(deleteCourse(id), {
            loading: 'Deleting course...',
            success: 'Course deleted successfully',
            error: error =>
                error instanceof Error
                    ? error.message
                    : 'Failed to delete course',
        });
    };
    const columns: ColumnDef<CourseListItem>[] = [
        {
            accessorKey: 'image_url',
            header: () => <div className="">Image</div>,
            cell: cellProps => {
                return (
                    <div className="flex items-center justify-center">
                        <Image
                            unoptimized={true}
                            alt={
                                cellProps.row?.original?.title ?? 'some new one'
                            }
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
                <div className="dark:text-gray-300">
                    {row.getValue('title')}
                </div>
            ),
        },
        {
            accessorKey: 'level',
            header: () => <div className="">Level</div>,
            cell: ({ row }) => (
                <div className="dark:text-gray-300">
                    {row.getValue('level')}
                </div>
            ),
        },
        {
            accessorKey: 'duration_value',
            header: () => <div className="">Duration</div>,

            cell: cellProps => {
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

            cell: cellProps => {
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

            cell: cellProps => {
                return (
                    <p className="flex items-center justify-center dark:text-gray-300">
                        {cellProps.row?.original.category_name}
                    </p>
                );
            },
        },
        {
            accessorKey: 'affiliation_name',
            header: () => <div className="">Affiliation</div>,
            cell: ({ row }) => (
                <div className="dark:text-gray-300">
                    {row?.original?.affiliation_name ?? '-'}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: () => <div className="">Created At</div>,

            cell: cellProps => {
                return (
                    <p className="flex items-center justify-center dark:text-gray-300">
                        {cellProps.row?.original.created_at}
                    </p>
                );
            },
        },
        {
            accessorKey: 'id',
            header: () => <div>Actions</div>,
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/admin/courses/${row.original.id}`}
                                >
                                    View
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    className=""
                                    href={`/admin/courses/edit/${row.original.id}`}
                                >
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className=""
                                disabled={
                                    row.original.intake_count.toString() === '0'
                                        ? false
                                        : true
                                }
                                onClick={async () => {
                                    const courseId = row.original.id;
                                    if (courseId) {
                                        toast.promise(
                                            adminIntakeGenerateForCourseAdvanced(
                                                courseId
                                            ),
                                            {
                                                loading:
                                                    'Generating intakes...',
                                                success: (result: any) => {
                                                    if (result.success) {
                                                        return (
                                                            result.message ||
                                                            'Intakes generated successfully'
                                                        );
                                                    }
                                                    throw new Error(
                                                        result.error ||
                                                            'Failed to generate intakes'
                                                    );
                                                },
                                                error: error =>
                                                    error instanceof Error
                                                        ? error.message
                                                        : 'Failed to generate intakes',
                                            }
                                        );
                                        await queryClient.invalidateQueries({
                                            queryKey: queryKeys.intakes.all,
                                        });
                                    }
                                }}
                            >
                                Generate Intakes{' '}
                                {row.original.intake_count.toString() !== '0'
                                    ? `(Disabled: ${row.original.intake_count} intakes exist)`
                                    : ''}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 dark:text-red-500"
                                onClick={() => handleDelete(row.original.id)}
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
        <Card>
            <CardHeader />
            <CardContent>
                <DataTable<CourseListItem, unknown>
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
