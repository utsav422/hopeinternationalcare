'use client';

import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminPaymentDetails } from '@/hooks/admin/payments-optimized';
import type { PaymentWithDetails } from '@/lib/types/payments';

interface PaymentDetailsCardProps {
    paymentDetails: PaymentWithDetails;
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
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">
                        <Skeleton className="h-6 w-40" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <InfoGridSkeleton rows={3} />
                </CardContent>
            </Card>

            {/* Enrollment Info */}
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">
                        <Skeleton className="h-6 w-44" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <InfoGridSkeleton rows={3} />
                </CardContent>
            </Card>

            {/* User Info */}
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <InfoGridSkeleton rows={3} />
                </CardContent>
            </Card>

            {/* Course Info */}
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">
                        <Skeleton className="h-6 w-36" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <InfoGridSkeleton rows={2} />
                    <SingleBlockSkeleton />
                </CardContent>
            </Card>

            {/* Remarks Info (repeated) */}
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">
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
const PaymentInfo = ({ paymentDetails }: PaymentDetailsCardProps) => {
    const { payment } = paymentDetails;
    if (!payment) return null;
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label className="" htmlFor="paymentId">
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
                <Label className="" htmlFor="amount">
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
                <Label className="" htmlFor="status">
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
                <Label className="" htmlFor="paidAt">
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
                <Label className="" htmlFor="method">
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
                <Label className="" htmlFor="isRefunded">
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

const EnrollmentInfo = ({ paymentDetails }: PaymentDetailsCardProps) => {
    const { enrollment } = paymentDetails;
    if (!enrollment) return null;
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label className="" htmlFor="enrollmentId">
                    Enrollment ID
                </Label>
                <p
                    className="font-medium text-sm leading-none dark:text-gray-300"
                    id="enrollmentId"
                >
                    {enrollment.id || 'N/A'}
                </p>
            </div>
            <div>
                <Label className="" htmlFor="enrolledAt">
                    Enrolled At
                </Label>
                <p
                    className="font-medium text-sm leading-none dark:text-gray-300"
                    id="enrolledAt"
                >
                    {enrollment.created_at
                        ? format(new Date(enrollment.created_at), 'PPP p')
                        : 'N/A'}
                </p>
            </div>
            <div>
                <Label className="" htmlFor="enrollmentStatus">
                    Enrollment Status
                </Label>
                <p
                    className="font-medium text-sm leading-none dark:text-gray-300"
                    id="enrollmentStatus"
                >
                    {enrollment.status || 'N/A'}
                </p>
            </div>
        </div>
    );
};

const UserInfo = ({ paymentDetails }: PaymentDetailsCardProps) => {
    const { user } = paymentDetails;
    if (!user) return null;
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label className="" htmlFor="userId">
                    User ID
                </Label>
                <p
                    className="font-medium text-sm leading-none dark:text-gray-300"
                    id="userId"
                >
                    {user.id || 'N/A'}
                </p>
            </div>
            <div>
                <Label className="" htmlFor="userEmail">
                    User Email
                </Label>
                <p
                    className="font-medium text-sm leading-none dark:text-gray-300"
                    id="userEmail"
                >
                    {user.email || 'N/A'}
                </p>
            </div>
            <div>
                <Label className="" htmlFor="userName">
                    User Name
                </Label>
                <p
                    className="font-medium text-sm leading-none dark:text-gray-300"
                    id="userName"
                >
                    {user.full_name || 'N/A'}
                </p>
            </div>
        </div>
    );
};

const CourseInfo = ({ paymentDetails }: PaymentDetailsCardProps) => {
    const { course } = paymentDetails;
    if (!course) return null;
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label className="" htmlFor="courseTitle">
                    Course Title
                </Label>
                <p
                    className="font-medium text-sm leading-none dark:text-gray-300"
                    id="courseTitle"
                >
                    {course.title || 'N/A'}
                </p>
            </div>
        </div>
    );
};

const RemarksInfo = ({ paymentDetails }: PaymentDetailsCardProps) => {
    const { payment } = paymentDetails;
    if (!payment) return null;
    return (
        <div>
            <Label className="" htmlFor="remarks">
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
};

export default function PaymentDetailsCard() {
    const params = useParams<{ id: string }>();
    const {
        data: queryResult,
        error,
        isLoading,
    } = useAdminPaymentDetails(params.id);

    if (error) {
        toast.error(
            error?.message ??
            'Something went wrong try again later, or contact to administrator'
        );
    }

    if (isLoading) {
        return <PaymentDetailsCardSkeleton />;
    }

    const paymentDetails = queryResult?.data;

    if (!paymentDetails) {
        return <div>Payment not found.</div>;
    }

    return (
        <div className="flex flex-wrap gap-4">
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <PaymentInfo paymentDetails={paymentDetails} />
                </CardContent>
            </Card>
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">Enrollments Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <EnrollmentInfo paymentDetails={paymentDetails} />
                </CardContent>
            </Card>
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">User Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <UserInfo paymentDetails={paymentDetails} />
                </CardContent>
            </Card>
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CourseInfo paymentDetails={paymentDetails} />
                    <RemarksInfo paymentDetails={paymentDetails} />
                </CardContent>
            </Card>
            <Card className="w-full max-w-3xl ">
                <CardHeader>
                    <CardTitle className="">Remarks Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <RemarksInfo paymentDetails={paymentDetails} />
                </CardContent>
            </Card>
        </div>
    );
}
