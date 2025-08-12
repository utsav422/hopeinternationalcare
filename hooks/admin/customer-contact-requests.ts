'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  adminGetCustomerContactRequests,
  deleteCustomerContactRequest,
  updateCustomerContactRequestStatus,
} from '@/lib/server-actions/admin/customer-contact-requests';
import { createCustomerContactRequest } from '@/lib/server-actions/user/customer-contact-requests';
import { queryKeys } from '../../lib/query-keys';

export function useCreateCustomerContactRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createCustomerContactRequest(formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerContactRequests.all,
      });
    },
  });
}

export function useGetCustomerContactRequests({
  page = 1,
  pageSize = 10,
  search,
  status,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
} = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.customerContactRequests.list({
      page,
      pageSize,
      search,
      status,
    }),
    queryFn: async () => {
      const result = await adminGetCustomerContactRequests({
        page,
        pageSize,
        search,
        status,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
}

export function useUpdateCustomerContactRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateCustomerContactRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerContactRequests.all,
      });
    },
  });
}

export function useDeleteCustomerContactRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomerContactRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerContactRequests.all,
      });
    },
  });
}
