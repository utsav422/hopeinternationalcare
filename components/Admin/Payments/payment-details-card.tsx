'use client';

import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPaymentDetailsWithOthersById } from '@/hooks/admin/payments';
import type { PaymentDetailsType } from '@/utils/db/drizzle-zod-schema/payments';

interface PaymentDetailsCardProps {
  payment: PaymentDetailsType;
}
const InfoGridSkeleton = ({ rows = 3 }) => (
  <div className="grid grid-cols-2 gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i + rows}>
        <Skeleton className="mb-1 h-4 w-24" /> {/* Label */}
        <Skeleton className="h-4 w-full" /> {/* Value */}
      </div>
    ))}
  </div>
);

const SingleBlockSkeleton = () => (
  <div>
    <Skeleton className="mb-1 h-4 w-24" />
    <Skeleton className="h-4 w-full" />
  </div>
);
function PaymentDetailsCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-wrap gap-4">
      {/* Payment Info */}
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InfoGridSkeleton rows={3} />
        </CardContent>
      </Card>

      {/* Enrollment Info */}
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">
            <Skeleton className="h-6 w-44" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InfoGridSkeleton rows={3} />
        </CardContent>
      </Card>

      {/* User Info */}
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InfoGridSkeleton rows={3} />
        </CardContent>
      </Card>

      {/* Course Info */}
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">
            <Skeleton className="h-6 w-36" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InfoGridSkeleton rows={2} />
          <SingleBlockSkeleton />
        </CardContent>
      </Card>

      {/* Remarks Info (repeated) */}
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">
            <Skeleton className="h-6 w-36" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SingleBlockSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
const PaymentInfo = ({ payment }: PaymentDetailsCardProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="dark:text-gray-200" htmlFor="paymentId">
          Payment ID
        </Label>
        <p
          className="font-medium text-sm leading-none dark:text-gray-300"
          id="paymentId"
        >
          {payment.id}
        </p>
      </div>
      <div>
        <Label className="dark:text-gray-200" htmlFor="amount">
          Amount
        </Label>
        <p
          className="font-medium text-sm leading-none dark:text-gray-300"
          id="amount"
        >
          ${payment.amount.toFixed(2)}
        </p>
      </div>
      <div>
        <Label className="dark:text-gray-200" htmlFor="status">
          Status
        </Label>
        <p
          className="font-medium text-sm leading-none dark:text-gray-300"
          id="status"
        >
          {payment.status}
        </p>
      </div>
      <div>
        <Label className="dark:text-gray-200" htmlFor="paidAt">
          Paid At
        </Label>
        <p
          className="font-medium text-sm leading-none dark:text-gray-300"
          id="paidAt"
        >
          {payment.paid_at ? format(new Date(payment.paid_at), 'PPP p') : 'N/A'}
        </p>
      </div>
      <div>
        <Label className="dark:text-gray-200" htmlFor="method">
          Method
        </Label>
        <p
          className="font-medium text-sm leading-none dark:text-gray-300"
          id="method"
        >
          {payment.method || 'N/A'}
        </p>
      </div>
      <div>
        <Label className="dark:text-gray-200" htmlFor="isRefunded">
          Refunded
        </Label>
        <p
          className="font-medium text-sm leading-none dark:text-gray-300"
          id="isRefunded"
        >
          {payment.is_refunded ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
};

const EnrollmentInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label className="dark:text-gray-200" htmlFor="enrollmentId">
        Enrollment ID
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="enrollmentId"
      >
        {payment.enrollment_id || 'N/A'}
      </p>
    </div>
    <div>
      <Label className="dark:text-gray-200" htmlFor="enrolledAt">
        Enrolled At
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="enrolledAt"
      >
        {payment.enrolled_at
          ? format(new Date(payment.enrolled_at), 'PPP p')
          : 'N/A'}
      </p>
    </div>
    <div>
      <Label className="dark:text-gray-200" htmlFor="enrollmentStatus">
        Enrollment Status
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="enrollmentStatus"
      >
        {payment.enrollment_status || 'N/A'}
      </p>
    </div>
  </div>
);

const UserInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label className="dark:text-gray-200" htmlFor="userId">
        User ID
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="userId"
      >
        {payment.user_id || 'N/A'}
      </p>
    </div>
    <div>
      <Label className="dark:text-gray-200" htmlFor="userEmail">
        User Email
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="userEmail"
      >
        {payment.userEmail || 'N/A'}
      </p>
    </div>
    <div>
      <Label className="dark:text-gray-200" htmlFor="userName">
        User Name
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="userName"
      >
        {payment.userName || 'N/A'}
      </p>
    </div>
  </div>
);

const CourseInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label className="dark:text-gray-200" htmlFor="courseId">
        Course ID
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="courseId"
      >
        {payment.courseId || 'N/A'}
      </p>
    </div>
    <div>
      <Label className="dark:text-gray-200" htmlFor="courseTitle">
        Course Title
      </Label>
      <p
        className="font-medium text-sm leading-none dark:text-gray-300"
        id="courseTitle"
      >
        {payment.courseTitle || 'N/A'}
      </p>
    </div>
  </div>
);

const RemarksInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div>
    <Label className="dark:text-gray-200" htmlFor="remarks">
      Remarks
    </Label>
    <p
      className="font-medium text-sm leading-none dark:text-gray-300"
      id="remarks"
    >
      {payment.remarks || 'N/A'}
    </p>
  </div>
);

export default function PaymentDetailsCard() {
  const params = useParams<{ id: string }>();
  const {
    data: queryResult,
    error,
    isLoading,
  } = useGetPaymentDetailsWithOthersById(params.id);
  if (error || !queryResult) {
    toast.error(
      error?.message ??
        'Somthing went wrong try again later, or contact to adminstrator'
    );
  }
  const payment = queryResult?.data as PaymentDetailsType;
  if (isLoading) {
    return <PaymentDetailsCardSkeleton />;
  }
  return (
    <div className="flex flex-wrap gap-4">
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Enrollments Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EnrollmentInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CourseInfo payment={payment} />
          <RemarksInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Remarks Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RemarksInfo payment={payment} />
        </CardContent>
      </Card>
    </div>
  );
}
