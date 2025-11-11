'use client';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
    useAdminEnrollmentDelete,
    useAdminEnrollmentList,
    useAdminEnrollmentUpdateStatus,
} from '@/hooks/admin/enrollments';
import {
    useAdminPaymentCreate,
    useAdminPaymentUpdate,
} from '@/hooks/admin/payments-optimized';
import { useDataTableQueryState } from '@/hooks/admin/use-data-table-query-state';

import type { EnrollmentListItem } from '@/lib/types/enrollments';
import {
    PaymentMethod,
    PaymentStatus,
    type TypeEnrollmentStatus,
    type TypePaymentStatus,
} from '@/lib/db/schema/enums';
import CancelEnrollmentForm from './enrollment-cancel-form-modal';

type EnrollementTableDataProps = EnrollmentListItem;

export default function EnrollmentTables() {
    const router = useRouter();
    const queryState = useDataTableQueryState();
    const { data: queryResult, error } = useAdminEnrollmentList({
        ...queryState,
    });
    if (error) {
        toast.error('Error fetching enrollments', {
            description: error.message,
        });
    }
    const { mutateAsync: deleteEnrollment } = useAdminEnrollmentDelete();
    const { mutateAsync: updateEnrollmentStatusMutation } =
        useAdminEnrollmentUpdateStatus();
    const createPaymentMutation = useAdminPaymentCreate();
    const updatePaymentMutation = useAdminPaymentUpdate();
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
            toast.promise(
                updateEnrollmentStatusMutation({
                    id: enrollmentId,
                    status: newStatus,
                }),
                {
                    loading: 'Updating enrollment status...',
                    success: () => {
                        if (newStatus === 'cancelled') {
                            setSelectedEnrollmentAndUserId({
                                enrollmentId,
                                userId: '',
                            });
                            setShowCancelModal(true);
                        }
                        if (newStatus === 'enrolled') {
                            if (price) {
                                const paymentData = {
                                    remarks: 'payment has been complete',
                                    enrollment_id: enrollmentId,
                                    amount: price,
                                    method: PaymentMethod.cash, // Default method, can be made dynamic
                                    status: 'completed' as TypePaymentStatus, // Use 'completed' as per enum
                                    paid_at: new Date().toISOString(),
                                };

                                const paymentMutation = paymentId
                                    ? updatePaymentMutation.mutateAsync({
                                          ...paymentData,
                                          id: paymentId,
                                      })
                                    : createPaymentMutation.mutateAsync(
                                          paymentData
                                      );

                                toast.promise(paymentMutation, {
                                    loading: 'Processing payment...',
                                    success: data => {
                                        return paymentId
                                            ? 'Payment details updated successfully!'
                                            : 'Payment details created successfully!';
                                    },
                                    error: error => {
                                        return (
                                            error?.message ||
                                            'Failed to upsert payment details.'
                                        );
                                    },
                                });
                            } else {
                                toast.error(
                                    'Failed to retrieve course price for payment.'
                                );
                            }
                        }
                        return 'Enrollment status updated successfully!';
                    },
                    error: error => {
                        return (
                            error?.message ||
                            'Failed to update enrollment status.'
                        );
                    },
                }
            );
        });
    };

    const handleDelete = async (id: string) => {
        if (id.length <= 0) {
            return;
        }
        if (!confirm('Are you sure you want to delete this enrollment?')) {
            return;
        }

        toast.promise(deleteEnrollment(id), {
            loading: 'Deleting enrollment...',
            success: 'Enrollment deleted successfully',
            error: error =>
                error instanceof Error
                    ? error.message
                    : 'Failed to delete enrollment',
        });
    };
    const columns: ColumnDef<EnrollementTableDataProps>[] = [
        {
            accessorKey: 'fullName',
            header: () => <div className="">Student Name</div>,
            cell: ({ row }) => (
                <div className="dark:text-gray-300">
                    {row.original.user.fullName}
                </div>
            ),
        },

        {
            accessorKey: 'email',
            header: () => <div className="">Email</div>,
            cell: ({ row }) => (
                <div className="dark:text-gray-300">
                    {row.original.user.email}
                </div>
            ),
        },
        {
            accessorKey: 'courseTitle',
            header: () => <div className="">Course</div>,
            cell: ({ row }) => (
                <div className="dark:text-gray-300">
                    {row.original.course.title}
                </div>
            ),
        },
        {
            accessorKey: 'start_date',
            header: () => <div className="">Start Date</div>,
            cell: ({ row }: { row: Row<EnrollementTableDataProps> }) => {
                const startDateValue = row.original.intake?.start_date;
                // Check if the value is a valid date string or null/undefined
                if (startDateValue && typeof startDateValue === 'string') {
                    const date = new Date(startDateValue);
                    // Check if the date is valid
                    if (!isNaN(date.getTime())) {
                        return (
                            <div className="dark:text-gray-30">
                                {date.toLocaleDateString()}
                            </div>
                        );
                    }
                }
                return <div className="dark:text-gray-300">N/A</div>;
            },
        },
        {
            accessorKey: 'payment.id',
            header: () => <div className="">Payment</div>,
            cell: ({ row }) => {
                const payment = row.original.payment;
                let bgColor = 'bg-gray-100'; // Default color

                if (payment?.status === PaymentStatus.completed) {
                    bgColor = 'bg-green-100 text-green-800';
                } else if (payment?.status === PaymentStatus.pending) {
                    bgColor = 'bg-yellow-100 text-yellow-800';
                } else if (payment?.status === PaymentStatus.failed) {
                    bgColor = 'bg-red-100 text-red-800';
                } else if (payment?.status === PaymentStatus.refunded) {
                    bgColor = 'bg-blue-100 text-blue-800';
                }

                return (
                    <>
                        {payment?.id ? (
                            <div
                                className={`px-2 py-1 rounded ${bgColor}`}
                                title={`Payment Status: ${payment.status}`}
                            >
                                {payment.amount}
                            </div>
                        ) : (
                            'No Payment'
                        )}
                    </>
                );
            },
        },
        {
            accessorKey: 'status',
            header: () => <div className="">Status</div>,
            cell: ({ row }: { row: Row<EnrollementTableDataProps> }) => {
                const status: TypeEnrollmentStatus = row.getValue('status');
                const enrollmentId = row.original.id;
                const payment_id = row.original.payment?.id;
                const price = row.original.course?.price;
                if (['enrolled', 'cancelled'].includes(status)) {
                    return <Badge className=" ">{status} </Badge>;
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
                        <SelectTrigger className="w-full capitalize ">
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
            header: () => <div className="">Actions</div>,
            enableHiding: false,
            cell: ({ row }: { row: Row<EnrollementTableDataProps> }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="" size="icon" variant="ghost">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/admin/enrollments/${row.original.id}`}
                                >
                                    View
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/admin/enrollments/edit/${row.original.id}`}
                                >
                                    Edit
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                                onClick={() =>
                                    handleDelete(row.original.id as string)
                                }
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
            <CardContent>
                <DataTable<EnrollementTableDataProps, unknown>
                    columns={columns}
                    data={data ?? []}
                    headerActionUrl="/admin/enrollments/new"
                    headerActionUrlLabel="Create New"
                    title="Enrollement Management"
                    total={total}
                />
                {selectedEnrollmentAndUserId.enrollmentId &&
                    selectedEnrollmentAndUserId.userId &&
                    (
                        selectedEnrollmentAndUserId.enrollmentId +
                        selectedEnrollmentAndUserId.userId
                    ).trim().length > 0 && (
                        <CancelEnrollmentForm
                            afterSubmitAction={() => {
                                setSelectedEnrollmentAndUserId({
                                    enrollmentId: null,
                                    userId: null,
                                });
                            }}
                            selectedEnrollmentAndUserId={
                                selectedEnrollmentAndUserId
                            }
                            setShowCancelModalAction={setShowCancelModal}
                            showCancelModal={showCancelModal}
                        />
                    )}
            </CardContent>
        </Card>
    );
}
