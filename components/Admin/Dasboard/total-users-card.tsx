'use client';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminDashboardTotalUsers } from '@/hooks/admin/dashboard';
import { DashboardCardSkeleton } from '.';

function TotalUserCard() {
    const { data: queryResult, error, isLoading } = useAdminDashboardTotalUsers();
    const totalUsers = queryResult.data;
    if (error) {
        toast.error(error.message);
    }
    if (isLoading) {
        return <DashboardCardSkeleton />;
    }
    return (
        <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm ">
                    Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground " />
            </CardHeader>
            <CardContent>
                <div className="font-bold text-2xl ">+{totalUsers}</div>
                <p className="text-muted-foreground text-xs ">
                    Registered users
                </p>
            </CardContent>
        </Card>
    );
}

export default TotalUserCard;
