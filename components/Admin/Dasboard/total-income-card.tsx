'use client';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminDashboardTotalIncome } from '@/hooks/admin/dashboard';
import { DashboardCardSkeleton } from '.';

function TotalIncomeCard() {
    const {
        data: queryResult,
        error,
        isLoading,
    } = useAdminDashboardTotalIncome();
    const totalIncome = queryResult.data;
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
                    Total Income
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground " />
            </CardHeader>
            <CardContent>
                <div className="font-bold text-2xl ">
                    ${Number(totalIncome).toFixed(2)}
                </div>
                <p className="text-muted-foreground text-xs">
                    Based on completed payments
                </p>
            </CardContent>
        </Card>
    );
}

export default TotalIncomeCard;
