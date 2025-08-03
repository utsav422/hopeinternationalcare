'use client';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummaryData } from '@/server-actions/admin/dashboard';
import { queryKeys } from './query-keys';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => getDashboardSummaryData(),
  });
};