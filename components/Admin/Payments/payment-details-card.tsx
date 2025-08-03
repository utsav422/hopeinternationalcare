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
      <Label htmlFor="paymentId">Payment ID</Label>
      <p className="font-medium text-sm leading-none" id="paymentId">
        {payment.id}
      </p>
    </div>
    <div>
      <Label htmlFor="amount">Amount</Label>
      <p className="font-medium text-sm leading-none" id="amount">
        ${payment.amount.toFixed(2)}
      </p>
    </div>
    <div>
      <Label htmlFor="status">Status</Label>
      <p className="font-medium text-sm leading-none" id="status">
        {payment.status}
      </p>
    </div>
    <div>
      <Label htmlFor="paidAt">Paid At</Label>
      <p className="font-medium text-sm leading-none" id="paidAt">
        {payment.paid_at ? format(new Date(payment.paid_at), 'PPP p') : 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="method">Method</Label>
      <p className="font-medium text-sm leading-none" id="method">
        {payment.method || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="isRefunded">Refunded</Label>
      <p className="font-medium text-sm leading-none" id="isRefunded">
        {payment.is_refunded ? 'Yes' : 'No'}
      </p>
    </div>
  </div>
);

const EnrollmentInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="enrollmentId">Enrollment ID</Label>
      <p className="font-medium text-sm leading-none" id="enrollmentId">
        {payment.enrollment_id || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="enrolledAt">Enrolled At</Label>
      <p className="font-medium text-sm leading-none" id="enrolledAt">
        {payment.enrolled_at
          ? format(new Date(payment.enrolled_at), 'PPP p')
          : 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="enrollmentStatus">Enrollment Status</Label>
      <p className="font-medium text-sm leading-none" id="enrollmentStatus">
        {payment.enrollment_status || 'N/A'}
      </p>
    </div>
  </div>
);

const UserInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="userId">User ID</Label>
      <p className="font-medium text-sm leading-none" id="userId">
        {payment.user_id || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="userEmail">User Email</Label>
      <p className="font-medium text-sm leading-none" id="userEmail">
        {payment.userEmail || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="userName">User Name</Label>
      <p className="font-medium text-sm leading-none" id="userName">
        {payment.userName || 'N/A'}
      </p>
    </div>
  </div>
);

const CourseInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="courseId">Course ID</Label>
      <p className="font-medium text-sm leading-none" id="courseId">
        {payment.courseId || 'N/A'}
      </p>
    </div>
    <div>
      <Label htmlFor="courseTitle">Course Title</Label>
      <p className="font-medium text-sm leading-none" id="courseTitle">
        {payment.courseTitle || 'N/A'}
      </p>
    </div>
  </div>
);

const RemarksInfo = ({ payment }: PaymentDetailsCardProps) => (
  <div>
    <Label htmlFor="remarks">Remarks</Label>
    <p className="font-medium text-sm leading-none" id="remarks">
      {payment.remarks || 'N/A'}
    </p>
  </div>
);

export default function PaymentDetailsCard({
  payment,
}: PaymentDetailsCardProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PaymentInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Enrollments Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EnrollmentInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CourseInfo payment={payment} />
          <RemarksInfo payment={payment} />
        </CardContent>
      </Card>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Remarks Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RemarksInfo payment={payment} />
        </CardContent>
      </Card>
    </div>
  );
}
