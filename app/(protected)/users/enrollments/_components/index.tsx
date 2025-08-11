'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { queryKeys } from '@/lib/query-keys';
import { getUserEnrollments } from '@/server-actions/user/enrollments-actions';

export default function UserEnrollments() {
  const { data: queryResult, isLoading } = useQuery({
    queryKey: queryKeys.enrollments.all,
    queryFn: () => getUserEnrollments(),
  });

  const enrollments = queryResult?.data || [];
  const total = queryResult?.total || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              className="h-48 animate-pulse rounded-lg bg-gray-200"
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }

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
          {enrollments.map((enrollment) => (
            <Card className="overflow-hidden" key={enrollment.id}>
              <CardHeader className="bg-muted p-4">
                <CardTitle className="line-clamp-1 text-base">
                  {enrollment.courseTitle}
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
