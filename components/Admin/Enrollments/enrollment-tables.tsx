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
import {
  useDeleteEnrollment,
  useGetEnrollments,
  useUpdateEnrollmentStatus,
} from '@/hooks/admin/enrollments';
import { useUpsertPayment } from '@/hooks/admin/payments';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';

import type { ZodEnrollmentSelectType } from '@/lib/db/drizzle-zod-schema/enrollments';
import {
  PaymentMethod,
  type TypeEnrollmentStatus,
  type TypePaymentStatus,
} from '@/lib/db/schema/enums';
import CancelEnrollmentForm from './enrollment-cancel-form-modal';

type EnrollementTableDataProps = {
  payment_id: string;
  price: number | null;
  fullName: string | null;
  email: string | null;
  courseTitle: string | null;
  start_date: string | null;
} & Partial<ZodEnrollmentSelectType>;

export default function EnrollmentTables() {
  const router = useRouter();
  const queryState = useDataTableQueryState();
  const { data: queryResult, error } = useGetEnrollments({ ...queryState });
  if (error) {
    toast.error('Error fetching categories', {
      description: error.message,
    });
  }
  const { mutateAsync: deleteEnrollment } = useDeleteEnrollment();
  const updateEnrollmentStatusMutation = useUpdateEnrollmentStatus();
  const upsertPaymentMutation = useUpsertPayment();
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
    paymentId: string | null,
    price: number | null
  ) => {
    startTransition(() => {
      try {
        updateEnrollmentStatusMutation.mutate(
          {
            id: enrollmentId,
            status: newStatus,
          },
          {
            onSuccess: () => {
              toast.success('Your inquiry has been sent!');
              if (newStatus === 'cancelled') {
                setSelectedEnrollmentAndUserId({
                  enrollmentId,
                  userId: '',
                });
                setShowCancelModal(true);
              }
              if (newStatus === 'enrolled') {
                if (price) {
                  upsertPaymentMutation.mutate(
                    {
                      id: paymentId as string,
                      remarks: 'payment has been complete',
                      enrollment_id: enrollmentId,
                      amount: price,
                      method: PaymentMethod.cash, // Default method, can be made dynamic
                      status: 'completed' as TypePaymentStatus, // Use 'completed' as per enum
                    },
                    {
                      onSuccess: () => {
                        toast.success(
                          paymentId
                            ? 'Payment details updated successfully!'
                            : 'Payment details created successfully!'
                        );
                      },
                      onError: (error) => {
                        toast.error(
                          error?.message || 'Failed to upsert payment details.'
                        );
                      },
                    }
                  );
                } else {
                  toast.error('Failed to retrieve course price for payment.');
                }
              }
            },
            onError: (error) => {
              toast.error(`Failed to send inquiry: ${error.message}`);
            },
          }
        );
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

  //   const performUpdateStatus = async (
  //     enrollmentId: string,
  //     newStatus: TypeEnrollmentStatus,
  //     price?: number,
  //     paymentId?: string
  //   ) => {
  //     const res: ServerActionResponse = await adminUpdateEnrollmentStatus(
  //       enrollmentId,
  //       newStatus
  //     );
  //     if (res?.success) {
  //       toast.success('Enrollment status updated successfully!');
  //       router.refresh();
  //       if (newStatus === 'enrolled') {
  //         if (price) {
  //           const paymentRes: ServerActionResponse = await adminUpsertPayment({
  //             id: paymentId,
  //             remarks: 'payment has been complete',
  //             enrollment_id: enrollmentId,
  //             amount: price,
  //             method: PaymentMethod.cash, // Default method, can be made dynamic
  //             status: 'completed' as TypePaymentStatus, // Use 'completed' as per enum
  //           });
  //           if (paymentRes?.success) {
  //             toast.success(
  //               paymentId
  //                 ? 'Payment details updated successfully!'
  //                 : 'Payment details created successfully!'
  //             );
  //           } else {
  //             toast.error(
  //               paymentRes?.message || 'Failed to upsert payment details.'
  //             );
  //           }
  //         } else {
  //           toast.error('Failed to retrieve course price for payment.');
  //         }
  //       }
  //     } else {
  //       toast.error(res?.message || 'Failed to update enrollment status.');
  //     }
  //     router.refresh();
  //   };

  const handleDelete = async (id: string) => {
    if (id.length <= 0) {
      return;
    }
    if (!confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }

    await toast.promise(deleteEnrollment(id), {
      loading: 'Deleting enrollment...',
      success: 'Enrollment deleted successfully',
      error: 'Failed to delete enrollment',
    });
  };
  const columns: ColumnDef<EnrollementTableDataProps>[] = [
    {
      accessorKey: 'fullName',
      header: () => <div className="dark:text-white">Student Name</div>,
      cell: ({ row }) => (
        <div className="dark:text-gray-300">{row.getValue('fullName')}</div>
      ),
    },

    {
      accessorKey: 'email',
      header: () => <div className="dark:text-white">Email</div>,
      cell: ({ row }) => (
        <div className="dark:text-gray-300">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'courseTitle',
      header: () => <div className="dark:text-white">Course</div>,
      cell: ({ row }) => (
        <div className="dark:text-gray-300">{row.getValue('courseTitle')}</div>
      ),
    },
    {
      accessorKey: 'start_date',
      header: () => <div className="dark:text-white">Start Date</div>,
      cell: ({ row }: { row: Row<EnrollementTableDataProps> }) => {
        const date = new Date(row.getValue('start_date'));
        return (
          <div className="dark:text-gray-300">{date.toLocaleDateString()}</div>
        );
      },
    },
    {
      accessorKey: 'payment_id',
      header: () => <div className="dark:text-white">Payment</div>,
      cell: ({ row }) => (
        <div className="dark:text-gray-300">{row.getValue('payment_id')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <div className="dark:text-white">Status</div>,
      cell: ({ row }: { row: Row<EnrollementTableDataProps> }) => {
        const status: TypeEnrollmentStatus = row.getValue('status');
        const enrollmentId = row.original.id;
        const payment_id = row.original.payment_id;
        const price = row.original.price;
        if (['enrolled', 'cancelled'].includes(status)) {
          return (
            <Badge className="dark:bg-gray-700 dark:text-gray-200">
              {' '}
              {status}{' '}
            </Badge>
          );
        }
        return (
          <Select
            disabled={isPending}
            onValueChange={(value: TypeEnrollmentStatus) =>
              handleStatusChange(
                value,
                enrollmentId as string,
                payment_id,
                price
              )
            }
            value={status}
          >
            <SelectTrigger className="w-[180px] capitalize dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
              <SelectItem className="dark:hover:bg-gray-700" value="requested">
                Requested
              </SelectItem>
              <SelectItem className="dark:hover:bg-gray-700" value="enrolled">
                Enrolled
              </SelectItem>
              <SelectItem className="dark:hover:bg-gray-700" value="cancelled">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'id',
      header: () => <div className="dark:text-white">Actions</div>,
      enableHiding: false,
      cell: ({ row }: { row: Row<EnrollementTableDataProps> }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="dark:text-white" size="icon" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="dark:border-gray-700 dark:bg-gray-800"
            >
              <DropdownMenuItem asChild>
                <Link
                  className="dark:text-gray-200 dark:hover:bg-gray-700"
                  href={`/admin/enrollments/${row.original.id}`}
                >
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  className="dark:text-gray-200 dark:hover:bg-gray-700"
                  href={`/admin/enrollments/edit/${row.original.id}`}
                >
                  Edit
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                onClick={() => handleDelete(row.original.id as string)}
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
    <Card className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <CardHeader className="dark:border-gray-700 dark:border-b" />
      <CardContent>
        <DataTable<EnrollementTableDataProps, unknown>
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
