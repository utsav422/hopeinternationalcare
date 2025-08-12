'use client';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTotalUsers } from '@/hooks/admin/dashboard';
import { DashboardCardSkeleton } from '.';

function TotalUserCard() {
  const { data: queryResult, error, isLoading } = useGetTotalUsers();
  const totalUsers = queryResult.data;
  if (error) {
    toast.error(error.message);
  }
  if (isLoading) {
    return <DashboardCardSkeleton />;
  }
  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm dark:text-white">
          Total Users
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl dark:text-white">+{totalUsers}</div>
        <p className="text-muted-foreground text-xs dark:text-gray-400">
          Registered users
        </p>
      </CardContent>
    </Card>
  );
}

export default TotalUserCard;
