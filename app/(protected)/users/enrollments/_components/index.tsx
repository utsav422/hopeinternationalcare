'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetUserEnrollments } from '@/hooks/user/user-enrollments';

interface UserEnrollment {
  id: string;
  status: string;
  created_at: string;
  intake_id: string | null;
  user_id: string | null;
  courseTitle: string | null;
  courseDescription: string | null;
  courseImage: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

export default function UserEnrollments() {
  const { data: queryResult } = useGetUserEnrollments();

  const enrollments = queryResult?.data || [];
  const total = queryResult?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">My Enrollments</h1>
        <p className="text-muted-foreground text-sm">
          Total: {total} enrollment{total !== 1 ? 's' : ''}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">
              You have no enrollments yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment: UserEnrollment) => (
            <Card className="overflow-hidden" key={enrollment.id}>
              <CardHeader className="bg-muted p-4">
                <CardTitle className="line-clamp-1 text-base">
                  {enrollment.courseTitle || 'Untitled Course'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{enrollment.status}</Badge>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(enrollment.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Intake Period</p>
                    <p>
                      {enrollment.start_date
                        ? format(new Date(enrollment.start_date), 'MMM d, yyyy')
                        : 'N/A'}{' '}
                      -{' '}
                      {enrollment.end_date
                        ? format(new Date(enrollment.end_date), 'MMM d, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                  {enrollment.notes && (
                    <div className="text-sm">
                      <p className="font-medium">Notes</p>
                      <p className="line-clamp-2 text-muted-foreground">
                        {enrollment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
