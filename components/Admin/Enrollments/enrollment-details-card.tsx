'use client';

import { format } from 'date-fns';
import { Loader } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminEnrollmentDetailsById } from '@/hooks/admin/enrollments';

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';

function EnrollmentDetailsCard() {
    const params = useParams<{ id: string }>();
    const { id } = params;
    const { data: enrollment, error, isLoading } = useAdminEnrollmentDetailsById(id);

    if (isLoading) {
        return <Loader />;
    }
    if (error) {
        toast.error(error.message);
    }
    if (!enrollment) {
        notFound();
    }
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Enrollment Details Card */}
            <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                    <CardTitle >Enrollment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Status
                        </p>
                        <Badge
                            variant="outline"
                        >
                            {enrollment.status}
                        </Badge>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Enrollment Date
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment.enrollment_data
                                ? format(new Date(enrollment.enrollment_data), 'PPP')
                                : 'N/A'}
                        </p>
                    </div>
                    {enrollment.cancelled_reason && (
                        <div>
                            <p className="font-medium text-muted-foreground text-sm ">
                                Cancellation Reason
                            </p>
                            <p className="font-semibold text-base dark:text-gray-300">
                                {enrollment.cancelled_reason}
                            </p>
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Notes
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment.notes || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Created At
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment.created_at
                                ? format(new Date(enrollment.created_at), 'PPP p')
                                : 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* User Details Card */}
            <Card className="col-span-full lg:col-span-1 ">
                <CardHeader>
                    <CardTitle >User Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Full Name
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment?.fullName || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Email
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment.email || 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Course Details Card */}
            <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Title
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment.courseTitle || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Course Highlight
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment?.course_highlight || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Duration
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment?.duration_value} {enrollment.duration_type || 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Intake Details Card */}
            <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                    <CardTitle>Intake Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            Start Date
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment?.start_date
                                ? format(new Date(enrollment.start_date), 'PPP')
                                : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-muted-foreground text-sm ">
                            End Date
                        </p>
                        <p className="font-semibold text-base dark:text-gray-300">
                            {enrollment?.end_date
                                ? format(new Date(enrollment.end_date), 'PPP')
                                : 'N/A'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* User Statistics Card */}
            {/* <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Total Authenticated Users
            </p>
            <p className="font-bold text-2xl">{totalAuthenticatedUsers}</p>
          </div>
          <div className="mt-4">
            <h3 className="mb-2 font-semibold text-lg">All Users</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.length > 0 ? (
                    allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        className="text-center text-muted-foreground"
                        colSpan={3}
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card> */}
        </div>
    );
}

export default EnrollmentDetailsCard;
