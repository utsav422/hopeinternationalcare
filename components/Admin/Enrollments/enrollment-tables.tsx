'use client';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  //  usePathname,
  useRouter,
  //   useSearchParams,
} from 'next/navigation';
// import { parseAsInteger, useQueryState } from 'nuqs';
import {
  //  useCallback,
  useState,
  useTransition,
} from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/Custom/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetEnrollments } from '@/hooks/enrollments';
import { useDataTableQueryState } from '@/hooks/use-data-table-query-state';
import {
  adminGetEnrollmentById,
  adminUpdateEnrollmentStatus,
} from '@/server-actions/admin/enrollments';
import { adminUpsertPayment } from '@/server-actions/admin/payments';
import type { ZodSelectEnrollmentType } from '@/utils/db/drizzle-zod-schema/enrollment';
import {
  PaymentMethod,
  type TypeEnrollmentStatus,
  type TypePaymentStatus,
} from '@/utils/db/schema/enums';
import CancelEnrollmentForm from './enrollment-cancel-form-modal';

type ServerActionResponse = {
  success: boolean;
  message?: string;
  errors?: string;
};

type EnrollementTableDataProps = {
  payment_id: string | null;
} & ZodSelectEnrollmentType;

export default function EnrollmentTables() {
  const router = useRouter();
  const queryState = useDataTableQueryState();
  const { data: queryResult, error } = useGetEnrollments({ ...queryState });
  if (error) {
    toast.error('Error fetching categories', {
      description: error.message,
    });
  }
  const data = queryResult?.data as EnrollementTableDataProps[];
  const total = queryResult?.total ?? 0;
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEnrollmentAndUserId, setSelectedEnrollmentAndUserId] =
    useState<{
      enrollmentId: string | null;
      userId: string | null;
    }>({ enrollmentId: null, userId: null });

  const handleStatusChange = (
    newStatus: TypeEnrollmentStatus,
    enrollmentId: string,
    paymentId: string | null
  ) => {
    startTransition(async () => {
      try {
        const { success, message, enrollment } =
          await adminGetEnrollmentById(enrollmentId);

        if (success && enrollment && enrollment.user) {
          performUpdateStatus(
            enrollment.id,
            newStatus,
            enrollment?.course?.price,
            paymentId ?? undefined
          );
          if (newStatus === 'cancelled') {
            setSelectedEnrollmentAndUserId({
              enrollmentId: enrollment.id,
              userId: enrollment.user.id,
            });
            setShowCancelModal(true);
            return;
          }
        }
        if (!success && message) {
          toast.error(message);
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unexpected Error Occured please contact to adminstrator'
        );
      } finally {
        router.refresh();
      }
    });
  };

  const performUpdateStatus = async (
    enrollmentId: string,
    newStatus: TypeEnrollmentStatus,
    price?: number,
    paymentId?: string
  ) => {
    const res: ServerActionResponse = await adminUpdateEnrollmentStatus(
      enrollmentId,
      newStatus
    );
    if (res?.success) {
      toast.success('Enrollment status updated successfully!');
      router.refresh();
      if (newStatus === 'enrolled') {
        if (price) {
          const paymentRes: ServerActionResponse = await adminUpsertPayment({
            id: paymentId,
            remarks: 'payment has been complete',
            enrollment_id: enrollmentId,
            amount: price,
            method: PaymentMethod.cash, // Default method, can be made dynamic
            status: 'completed' as TypePaymentStatus, // Use 'completed' as per enum
          });
          if (paymentRes?.success) {
            toast.success(
              paymentId
                ? 'Payment details updated successfully!'
                : 'Payment details created successfully!'
            );
          } else {
            toast.error(
              paymentRes?.message || 'Failed to upsert payment details.'
            );
          }
        } else {
          toast.error('Failed to retrieve course price for payment.');
        }
      }
    } else {
      toast.error(res?.message || 'Failed to update enrollment status.');
    }
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Enrollment deleted successfully!');
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to delete enrollment.');
      }
    } catch (_error) {
      // TODO: Log error deleting enrollment using a proper logging mechanism
      toast.error(
        'An unexpected error occurred while deleting the enrollment.'
      );
    }
  };
  const columns: ColumnDef<
    ZodSelectEnrollmentType & { payment_id: string | null }
  >[] = [
    {
      accessorKey: 'full_name',
      header: 'Student Name',
    },

    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'courseTitle',
      header: 'Course',
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({
        row,
      }: {
        row: Row<ZodSelectEnrollmentType & { payment_id: string | null }>;
      }) => {
        const date = new Date(row.getValue('start_date'));
        return date.toLocaleDateString();
      },
    },
    { accessorKey: 'payment_id', header: 'Payment' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({
        row,
      }: {
        row: Row<ZodSelectEnrollmentType & { payment_id: string | null }>;
      }) => {
        const status: TypeEnrollmentStatus = row.getValue('status');
        const enrollmentId = row.original.id;
        const payment_id = row.original.payment_id;
        if (['enrolled', 'cancelled'].includes(status)) {
          return <Badge> {status} </Badge>;
        }
        return (
          <Select
            disabled={isPending}
            onValueChange={(value: TypeEnrollmentStatus) =>
              handleStatusChange(value, enrollmentId, payment_id)
            }
            value={status}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="enrolled">Enrolled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      enableHiding: false,
      cell: ({
        row,
      }: {
        row: Row<ZodSelectEnrollmentType & { payment_id: string | null }>;
      }) => {
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
                <Link href={`/admin/enrollments/${row.original.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/enrollments/edit/${row.original.id}`}>
                  Edit
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600"
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
        <DataTable<
          ZodSelectEnrollmentType & { payment_id: string | null },
          unknown
        >
          columns={columns}
          data={data ?? []}
          headerActionUrl="/admin/enrollment/new"
          headerActionUrlLabel="Create New"
          title="Enrollement Management"
          total={total}
        />
        <CancelEnrollmentForm
          afterSubmit={() => {
            setSelectedEnrollmentAndUserId({
              enrollmentId: null,
              userId: null,
            });
          }}
          selectedEnrollmentAndUserId={selectedEnrollmentAndUserId}
          setShowCancelModal={setShowCancelModal}
          showCancelModal={showCancelModal}
        />
      </CardContent>
    </Card>
  );
}
