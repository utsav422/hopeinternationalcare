'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminGetRefunds,
  adminUpsertRefund,
} from '@/server-actions/admin/refunds';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { queryKeys } from './query-keys';

export const useGetRefunds = () => {
  return useQuery({
    queryKey: queryKeys.refunds.all,
    queryFn: () => adminGetRefunds(),
  });
};

export const useUpsertRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TablesInsert<'refunds'>) => adminUpsertRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
    },
  });
};