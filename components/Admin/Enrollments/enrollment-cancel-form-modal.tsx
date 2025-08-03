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
import { adminUpdateEnrollmentStatus } from '@/server-actions/admin/enrollments';
import {
  adminGetPaymentDetailsByEnrollmentId,
  adminUpsertPayment,
} from '@/server-actions/admin/payments';
import { adminUpsertRefund } from '@/server-actions/admin/refunds';
import type { ZodSelectPaymentType } from '@/utils/db/drizzle-zod-schema/payments';

export default function ({
  setShowCancelModal,
  showCancelModal,
  selectedEnrollmentAndUserId: { enrollmentId, userId },
  afterSubmit,
}: {
  setShowCancelModal: Dispatch<SetStateAction<boolean>>;
  showCancelModal: boolean;
  selectedEnrollmentAndUserId: {
    enrollmentId: string | null;
    userId: string | null;
  };
  afterSubmit: () => void;
}) {
  const router = useRouter();
  //   const fetchPaymentDetailsPromise = adminGetPaymentDetailsByEnrollmentId(
  //     selectedEnrollmentId as string
  //   );

  //   const pd = use(fetchPaymentDetailsPromise);

  const [cancelledReason, setCancelledReason] = useState('');
  const [refund, setRefund] = useState<CheckedState>(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] =
    useState<ZodSelectPaymentType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPaymentDetailFetchPending, startPaymentDetailsFetchTransition] =
    useTransition();

  const fetchPaymentDetail = async () => {
    const payment = await adminGetPaymentDetailsByEnrollmentId(
      enrollmentId as string
    );
    if (payment.data) {
      setPaymentDetails(payment.data as ZodSelectPaymentType);
    }
  };
  useEffect(() => {
    if (enrollmentId && (enrollmentId as string) && enrollmentId.length > 0) {
      startPaymentDetailsFetchTransition(() => {
        fetchPaymentDetail();
      });
    }
    return () => {
      null;
    };
  }, [enrollmentId, userId]);

  return (
    <div>
      {/* <pre>{JSON.stringify(pd, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(paymentDetails, null, 2)}</pre> */}
      <AlertDialog onOpenChange={setShowCancelModal} open={showCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling this enrollment. Choose to
              refund the payment or not if payment is existed
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancelledReason">Reason</Label>
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
                <Label>Payment Info</Label>
                <p className={'text-muted-foreground text-sm'} id={'payment'}>
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
                <Card className="space-x-2 p-3">
                  <Checkbox name="refund" onCheckedChange={setRefund} />
                  <Label>Refund this payment?</Label>
                  {refund && (
                    <div>
                      <Label htmlFor="amount">Refund Amount</Label>
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
              <p className="text-muted">
                No Payment Details for enrollment found
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending || !cancelledReason}
              onClick={() => {
                if (enrollmentId && cancelledReason) {
                  startTransition(async () => {
                    try {
                      const res = await adminUpdateEnrollmentStatus(
                        enrollmentId,
                        'cancelled',
                        cancelledReason
                      );
                      if (res?.success) {
                        toast.success('Enrollment cancelled successfully!');
                        router.refresh();
                      } else {
                        toast.error(
                          res?.message || 'Failed to cancel enrollment.'
                        );
                      }

                      if (refund && paymentDetails) {
                        // prepare new  refund data
                        const _newRefundData = {
                          payment_id: paymentDetails.id,
                          enrollment_id: enrollmentId,
                          user_id: userId,
                          reason: cancelledReason,
                          amount: refundAmount,
                          created_at: new Date().toISOString(),
                        };

                        // upsert new refund data
                        const {
                          data: _refundData,
                          message: refundMessage,
                          success: refundSuccess,
                        } = await adminUpsertRefund(_newRefundData);

                        // prepare old payment data for update
                        const _updatedPayment = {
                          ...paymentDetails,
                          remarks: `payment of ${paymentDetails.amount} is refunded with partial amount ${refundAmount} return to user.`,
                          is_refunded: true,
                          refunded_at: new Date().toISOString(),
                          refunded_amount: refundAmount,
                          reason: cancelledReason,
                        };

                        // upon refund success perform update payment details
                        if (refundSuccess) {
                          toast.success(refundMessage);
                          const {
                            data: _paymentData,
                            message: paymentMessage,
                            success: paymentSuccess,
                          } = await adminUpsertPayment(_updatedPayment);

                          if (paymentSuccess) {
                            toast.success(paymentMessage);
                            return;
                          }
                          toast.error(paymentMessage);
                        }
                        toast.error(refundMessage);
                      }
                      setShowCancelModal(false);
                      setCancelledReason('');
                      afterSubmit();
                    } catch (error: unknown) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : 'Unexpected error occured'
                      );
                    }
                  });
                } else {
                  toast.error('Please provide a cancellation reason.');
                }
              }}
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// export default EnrollmentCancelFormModal;
