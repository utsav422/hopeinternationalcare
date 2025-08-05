'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { PaymentDetailsType } from '@/utils/db/drizzle-zod-schema/payments';

interface PaymentDetailsCardProps {
  payment: PaymentDetailsType;
}

const PaymentInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="paymentId" className="dark:text-gray-200">Payment ID</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="paymentId">
        {payment.id}
      </p>
    </div>
    <div>
      <Label htmlFor="amount" className="dark:text-gray-200">Amount</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="amount">
        ${payment.amount.toFixed(2)}
      </p>
    </div>
    <div>
      <Label htmlFor="status" className="dark:text-gray-200">Status</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="status">
        {payment.status}
      </p>
    </div>
    <div>
      <Label htmlFor="paidAt" className="dark:text-gray-200">Paid At</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="paidAt">
        {payment.paid_at ? format(new Date(payment.paid_at), 'PPP p') : 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="method" className="dark:text-gray-200">Method</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="method">
        {payment.method || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="isRefunded" className="dark:text-gray-200">Refunded</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="isRefunded">
        {payment.is_refunded ? 'Yes' : 'No'}
      </p>
    </div>
  </div>
);

const EnrollmentInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="enrollmentId" className="dark:text-gray-200">Enrollment ID</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="enrollmentId">
        {payment.enrollment_id || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="enrolledAt" className="dark:text-gray-200">Enrolled At</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="enrolledAt">
        {payment.enrolled_at
          ? format(new Date(payment.enrolled_at), 'PPP p')
          : 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="enrollmentStatus" className="dark:text-gray-200">Enrollment Status</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="enrollmentStatus">
        {payment.enrollment_status || 'N/A'}
      </p>
    </div>
  </div>
);

const UserInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="userId" className="dark:text-gray-200">User ID</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="userId">
        {payment.user_id || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="userEmail" className="dark:text-gray-200">User Email</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="userEmail">
        {payment.userEmail || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="userName" className="dark:text-gray-200">User Name</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="userName">
        {payment.userName || 'N/A'}
      </p>
    </div>
  </div>
);

const CourseInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="courseId" className="dark:text-gray-200">Course ID</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="courseId">
        {payment.courseId || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="courseTitle" className="dark:text-gray-200">Course Title</Label>
      <p className="font-medium text-sm leading-none dark:text-gray-300" id="courseTitle">
        {payment.courseTitle || 'N/A'}
      </p>
    </div>
  </div>
);

const RemarksInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div>
    <Label htmlFor="remarks" className="dark:text-gray-200">Remarks</Label>
    <p className="font-medium text-sm leading-none dark:text-gray-300" id="remarks">
      {payment.remarks || 'N/A'}
    </p>
  </div>
);

export default function PaymentDetailsCard({
  payment,
}: PaymentDetailsCardProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Card className="w-full max-w-3xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Enrollments Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EnrollmentInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CourseInfo payment={payment} />
          <RemarksInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Remarks Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RemarksInfo payment={payment} />
        </CardContent>
      </Card>
    </div>
  );
