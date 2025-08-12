'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  adminGetRefunds,
  adminUpsertRefund,
} from '@/lib/server-actions/admin/refunds';
import type { TablesInsert } from '@/utils/supabase/database.types';

export const useGetRefunds = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) => {
  return useSuspenseQuery({
    queryKey: queryKeys.refunds.list(params),
    queryFn: async () => {
      const result = await adminGetRefunds(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
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
