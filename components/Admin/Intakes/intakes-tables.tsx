'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useAdminIntakeDelete,
    useAdminIntakeList,
} from '@/hooks/admin/intakes-optimized';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';
import type { IntakeListItem } from '@/lib/types/intakes';
import { DataTable } from '../../Custom/data-table';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';

function IntakesTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
}

type IntakeWithNestedCourse = IntakeListItem & {
    course?: {
        title: string;
        price: number;
    };
};

export default function IntakesTables() {
    const queryState = useDataTableQueryState();

    const { data: queryResult, error } = useAdminIntakeList({ ...queryState });
    if (error) {
        toast.error('Error fetching intakes', {
            description: error.message,
        });
    }
    console.log('Intakes queryResult:', queryResult?.data);
    const data = queryResult?.data?.data.map((intake: IntakeListItem) => ({
        ...intake,
        courseTitle: intake.course?.title,
        coursePrice: intake.course?.price,
    }));
    const { mutateAsync: deleteIntake } = useAdminIntakeDelete();

    const currentYear = new Date().getFullYear();
    const currentIntakes = data?.filter((intake: any) => {
        return new Date(intake?.start_date).getFullYear() === currentYear;
    });
    const currentTotal = currentIntakes?.length ?? 0;
    const historyIntakes = data?.filter((intake: any) => {
        return new Date(intake?.start_date).getFullYear() !== currentYear;
    });
    const historyTotal = historyIntakes?.length ?? 0;

    const handleDelete = async (id: string) => {
        toast.promise(deleteIntake(id), {
            loading: 'Deleting intake...',
            success: 'Intake deleted successfully',
            error: error =>
                error instanceof Error
                    ? error.message
                    : 'Failed to delete intake',
        });
    };

    const columns = [
        {
            accessorKey: 'courseTitle',
            header: () => <div className=" ">Course Title</div>,
            cell: ({ row }: { row: { original: IntakeListItem } }) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {row.original.course?.title}
                </span>
            ),
        },
        {
            accessorKey: 'start_date',
            header: () => <div className=" ">Start Date</div>,
            cell: ({ row }: { row: { original: IntakeListItem } }) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {new Date(row.original.start_date).toLocaleDateString()}
                </span>
            ),
        },
        {
            accessorKey: 'end_date',
            header: () => <div className=" ">End Date</div>,
            cell: ({ row }: { row: { original: IntakeListItem } }) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {new Date(row.original.end_date).toLocaleDateString()}
                </span>
            ),
        },
        {
            accessorKey: 'capacity',
            header: () => <div className=" ">Capacity</div>,
            cell: ({ row }: { row: { original: IntakeListItem } }) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {row.original.capacity}
                </span>
            ),
        },
        {
            accessorKey: 'total_registered',
            header: () => <div className=" ">Total Registered</div>,
            cell: ({ row }: { row: { original: IntakeListItem } }) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {row.original.enrollment_count}
                </span>
            ),
        },
        {
            accessorKey: 'is_open',
            header: () => <div className=" ">Is Open</div>,
            cell: ({ row }: { row: { original: IntakeListItem } }) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {row.original.is_open ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }: { row: { original: IntakeListItem } }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                            ...
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        <DropdownMenuItem asChild>
                            <Link
                                className="cursor-pointer "
                                href={`/admin/intakes/${row.original.id}`}
                            >
                                View
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                className="cursor-pointer "
                                href={`/admin/intakes/edit/${row.original.id}`}
                            >
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                            className="cursor-pointer text-red-600 dark:text-red-500 "
                            onClick={() => handleDelete(row.original.id)}
                        >
                            Delete
                        </DropdownMenuItem> */}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <Suspense fallback={<IntakesTableSkeleton />}>
            <Tabs defaultValue={'current'}>
                <TabsList className="">
                    <TabsTrigger value="current">Current Intakes</TabsTrigger>
                    <TabsTrigger value="history">History Intakes</TabsTrigger>
                </TabsList>
                <TabsContent value="current">
                    <DataTable
                        columns={columns}
                        data={currentIntakes ?? []}
                        headerActionUrl="/admin/intakes/new"
                        headerActionUrlLabel="Create New"
                        total={currentTotal}
                    />
                </TabsContent>
                <TabsContent value="history">
                    <DataTable
                        columns={columns}
                        data={historyIntakes ?? []}
                        headerActionUrl="/admin/intakes/new"
                        headerActionUrlLabel="Create New"
                        total={historyTotal}
                    />
                </TabsContent>
            </Tabs>
        </Suspense>
    );
}
