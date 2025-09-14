'use client';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { useRouter } from 'next/navigation';
import {
    type Dispatch,
    type SetStateAction,
    useEffect,
    useState,
    useTransition,
} from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAdminEnrollmentUpdateStatus } from '@/hooks/admin/enrollments';
import {
    useAdminPaymentDetailsByEnrollmentId,
    useAdminPaymentUpsert,
} from '@/hooks/admin/payments';
import { useAdminRefundUpsert } from '@/hooks/admin/refunds';

export default function CancelEnrollmentFormModal ({
    setShowCancelModalAction,
    showCancelModal,
    selectedEnrollmentAndUserId: { enrollmentId, userId },
    afterSubmitAction,
}: {
    setShowCancelModalAction: Dispatch<SetStateAction<boolean>>;
    showCancelModal: boolean;
    selectedEnrollmentAndUserId: {
        enrollmentId: string | null;
        userId: string | null;
    };
    afterSubmitAction: () => void;
}) {
    const router = useRouter();
    const { data: paymentDetails, isPending: isPaymentDetailFetchPending } =
        useAdminPaymentDetailsByEnrollmentId(enrollmentId as string);
    const { mutateAsync: updateEnrollmentStatus } = useAdminEnrollmentUpdateStatus();
    const { mutateAsync: upsertRefund } = useAdminRefundUpsert();
    const { mutateAsync: upsertPayment } = useAdminPaymentUpsert();

    const [cancelledReason, setCancelledReason] = useState('');
    const [refund, setRefund] = useState<CheckedState>(false);
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (paymentDetails) {
            setRefundAmount(paymentDetails.amount);
        }
    }, [paymentDetails]);

    const handleConfirmCancellation = () => {
        if (enrollmentId && cancelledReason) {
            startTransition(async () => {
                toast.promise(
                    updateEnrollmentStatus({
                        id: enrollmentId,
                        status: 'cancelled',
                        cancelled_reason: cancelledReason,
                    }),
                    {
                        loading: 'Cancelling enrollment...',
                        success: async () => {
                            if (refund && paymentDetails) {
                                toast.promise(
                                    upsertRefund({
                                        payment_id: paymentDetails.id,
                                        enrollment_id: enrollmentId,
                                        user_id: userId,
                                        reason: cancelledReason,
                                        amount: refundAmount,
                                        created_at: new Date().toISOString(),
                                    }),
                                    {
                                        loading: 'Processing refund...',
                                        success: async () => {
                                            toast.promise(
                                                upsertPayment({
                                                    ...paymentDetails,
                                                    remarks: `payment of ${paymentDetails.amount} is refunded with partial amount ${refundAmount} return to user.`,
                                                    is_refunded: true,
                                                    refunded_at: new Date().toISOString(),
                                                    refunded_amount: refundAmount,
                                                }),
                                                {
                                                    loading: 'Updating payment details...',
                                                    success: 'Payment details updated',
                                                    error: (error) => error instanceof Error ? error.message : 'Failed to update payment details',
                                                }
                                            );
                                            return 'Refund processed successfully';
                                        },
                                        error: (error) => error instanceof Error ? error.message : 'Failed to process refund',
                                    }
                                );
                            }
                            router.refresh();
                            setShowCancelModalAction(false);
                            setCancelledReason('');
                            afterSubmitAction();
                            return 'Enrollment cancelled successfully!';
                        },
                        error: (error) => error instanceof Error ? error.message : 'Failed to cancel enrollment',
                    }
                );
            });
        } else {
            toast.error('Please provide a cancellation reason.');
        }
    };

    return (
        <div>
            <AlertDialog onOpenChange={setShowCancelModalAction} open={showCancelModal}>
                <AlertDialogContent className="">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="">
                            Cancel Enrollment
                        </AlertDialogTitle>
                        <AlertDialogDescription className="">
                            Please provide a reason for cancelling this enrollment. Choose to
                            refund the payment or not if payment is existed
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="" htmlFor="cancelledReason">
                                Reason
                            </Label>
                            <Textarea
                                id="cancelledReason"
                                onChange={(e) => setCancelledReason(e.target.value)}
                                placeholder="e.g., Student dropped out, Course cancelled"
                                value={cancelledReason}
                            />
                        </div>
                        {isPaymentDetailFetchPending && (
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        )}
                        {paymentDetails?.amount && (
                            <div className="grid gap-2">
                                <Label className="">Payment Info</Label>
                                <p
                                    className={'text-muted-foreground text-sm '}
                                    id={'payment'}
                                >
                                    This enrollment has an payment record, where
                                    <span className="block">
                                        Status:{' '}
                                        {paymentDetails?.status ?? (
                                            <Skeleton className="h-4 w-[200px]" />
                                        )}
                                    </span>
                                    <span className="block">
                                        Amount: {paymentDetails?.amount}
                                    </span>
                                    <span className="block">
                                        Created At: {paymentDetails?.method}
                                    </span>
                                    <span className="block">
                                        Method: {paymentDetails?.created_at}
                                    </span>
                                </p>
                                <Card className="space-x-2 p-3 ">
                                    <Checkbox
                                        name="refund"
                                        onCheckedChange={setRefund}
                                    />
                                    <Label className="">
                                        Refund this payment?
                                    </Label>
                                    {refund && (
                                        <div>
                                            <Label className="" htmlFor="amount">
                                                Refund Amount
                                            </Label>
                                            <Input
                                                max={paymentDetails.amount}
                                                name="amount"
                                                onChange={(e) => {
                                                    if (Number(e.target.value) <= paymentDetails.amount) {
                                                        setRefundAmount(Number(e.target.value));
                                                        return;
                                                    }
                                                    toast.error(
                                                        `Refund Amount cannot be greater than paid amount i.e: ${paymentDetails.amount}`
                                                    );
                                                }}
                                                pattern="\d{1,5}"
                                                placeholder="Enter the amount to refund to user"
                                                type="text"
                                                value={refundAmount}
                                            />
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}
                        {!(paymentDetails || isPaymentDetailFetchPending) && (
                            <p className="text-muted ">
                                No Payment Details for enrollment found
                            </p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isPending}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="dark:bg-red-600  dark:hover:bg-red-700"
                            disabled={isPending || !cancelledReason}
                            onClick={handleConfirmCancellation}
                        >
                            Confirm Cancellation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
