'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
import type { CustomEnrollmentDetailsType } from '@/utils/db/drizzle-zod-schema/enrollment';

function EnrollmentDetailsCard({
  enrollment,
}: {
  enrollment: CustomEnrollmentDetailsType;
}) {
  if (!enrollment) {
    return (
      <p className="text-center text-muted-foreground">
        No enrollment details found.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Enrollment Details Card */}
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <p className="font-medium text-muted-foreground text-sm">Status</p>
            <Badge className="mt-1" variant="outline">
              {enrollment.status}
            </Badge>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Enrollment Date
            </p>
            <p className="font-semibold text-base">
              {enrollment.enrollment_date
                ? format(new Date(enrollment.enrollment_date), 'PPP')
                : 'N/A'}
            </p>
          </div>
          {enrollment.cancelled_reason && (
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Cancellation Reason
              </p>
              <p className="font-semibold text-base">
                {enrollment.cancelled_reason}
              </p>
            </div>
          )}
          <div>
            <p className="font-medium text-muted-foreground text-sm">Notes</p>
            <p className="font-semibold text-base">
              {enrollment.notes || 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Created At
            </p>
            <p className="font-semibold text-base">
              {enrollment.created_at
                ? format(new Date(enrollment.created_at), 'PPP p')
                : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Details Card */}
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Full Name
            </p>
            <p className="font-semibold text-base">
              {enrollment.user?.full_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">Email</p>
            <p className="font-semibold text-base">
              {enrollment.user?.email || 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">Phone</p>
            <p className="font-semibold text-base">
              {enrollment.user?.phone || 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">Role</p>
            <Badge className="mt-1" variant="secondary">
              {enrollment.user?.role || 'N/A'}
            </Badge>
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
            <p className="font-medium text-muted-foreground text-sm">Title</p>
            <p className="font-semibold text-base">
              {enrollment.course?.title || 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Description
            </p>
            <p className="font-semibold text-base">
              {enrollment.course?.description || 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Duration
            </p>
            <p className="font-semibold text-base">
              {enrollment.course?.duration_value}{' '}
              {enrollment.course?.duration_type || 'N/A'}
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
            <p className="font-medium text-muted-foreground text-sm">
              Start Date
            </p>
            <p className="font-semibold text-base">
              {enrollment.intake?.start_date
                ? format(new Date(enrollment.intake.start_date), 'PPP')
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              End Date
            </p>
            <p className="font-semibold text-base">
              {enrollment.intake?.end_date
                ? format(new Date(enrollment.intake.end_date), 'PPP')
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
