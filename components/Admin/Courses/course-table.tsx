// /components/Admin/Courses/CourseTable.tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
// import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// import { parseAsInteger, useQueryState } from 'nuqs';
// import { useCallback } from 'react';
import { DataTable } from '@/components/Custom/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetCourses } from '@/hooks/courses';
import { useDataTableQueryState } from '@/hooks/use-data-table-query-state';
// import { Input } from '@/components/ui/input';
// import useDebounce from '@/hooks/use-debounce';
import type {
  ZodCourseSelectSchema,
  //   ZodInsertCourseType,
  ZodSelectCourseType,
} from '@/utils/db/drizzle-zod-schema/courses';

// interface Props {
//   data: Array<ZodInsertCourseType & { category_name: string | null }>;
//   total: number;
// }

export default function CourseTable() {
  const router = useRouter();
  const queryState = useDataTableQueryState();
  const { data: queryResult, error } = useGetCourses({ ...queryState });
  if (error) {
    toast.error('Error fetching categories', {
      description: error.message,
    });
  }

  const data = queryResult?.data as Array<
    typeof ZodCourseSelectSchema._zod.input & { category_name: string | null }
  >;
  const total = queryResult?.total ?? 0;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to delete course');
    }
  };
  const columns: ColumnDef<
    ZodSelectCourseType & { category_name: string | null }
  >[] = [
    {
      accessorKey: 'image_url',
      header: 'Image',
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
      header: 'Title',
    },
    {
      accessorKey: 'level',
      header: 'Level',
    },
    {
      accessorKey: 'duration_value',
      header: 'Duration',

      cell: (cellProps) => {
        return (
          <p className="flex items-center justify-center">
            {cellProps.row?.original.duration_value}
          </p>
        );
      },
    },
    {
      accessorKey: 'duration_type',
      header: 'Duration',

      cell: (cellProps) => {
        return (
          <p className="flex items-center justify-center">
            {cellProps.row?.original.duration_type}
          </p>
        );
      },
    },
    {
      accessorKey: 'category_name',
      header: 'Category',

      cell: (cellProps) => {
        return (
          <p className="flex items-center justify-center">
            {cellProps.row?.original.category_name}
          </p>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Create At',

      cell: (cellProps) => {
        return (
          <p className="flex items-center justify-center">
            {cellProps.row?.original.created_at}
          </p>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'Actions',

      cell: (cellProps) => {
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
                <Link href={`/admin/courses/${cellProps?.row.original.slug}`}>
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/courses/edit/${cellProps?.row.original.slug}`}
                >
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const courseId = cellProps?.row.original.id;
                  if (courseId) {
                    const {
                      generateIntakesForCourseAdvanced,
                    } = require('@/server-actions/admin/intakes');
                    await generateIntakesForCourseAdvanced(courseId);
                    router.refresh();
                  }
                }}
              >
                Generate Intakes
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
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
    <Card>
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
