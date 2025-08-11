'use client';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTotalIncome } from '@/hooks/admin/dashboard';


function TotalIncomeCard() {
  const { data: totalIncome } = useGetTotalIncome();

  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm dark:text-white">
          Total Income
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl dark:text-white">
          ${Number(totalIncome).toFixed(2)}
        </div>
        <p className="text-muted-foreground text-xs dark:text-gray-400">
          Based on completed payments
        </p>
      </CardContent>
    </Card>
  );
}

export default TotalIncomeCard;
