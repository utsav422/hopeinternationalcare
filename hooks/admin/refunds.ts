'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { adminUpsertRefund } from '@/lib/server-actions/admin/refunds';
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
      const searchParams = new URLSearchParams({
        page: params.page?.toString() || '1',
        pageSize: params.pageSize?.toString() || '10',
        search: params.search || '',
        ...(params.status && { status: params.status }),
      });
      const response = await fetch(`/api/admin/refunds?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch refunds');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch refunds');
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
