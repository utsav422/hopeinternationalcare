'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteCustomerContactRequest,
  getCustomerContactRequests,
  updateCustomerContactRequestStatus,
} from '@/server-actions/admin/customer-contact-requests';
import { createCustomerContactRequest } from '@/server-actions/user/customer-contact-requests';
import { queryKeys } from './query-keys';

export function useCreateCustomerContactRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomerContactRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerContactRequests.all,
      });
    },
  });
}

export function useGetCustomerContactRequests() {
  return useQuery({
    queryKey: queryKeys.customerContactRequests.all,
    queryFn: getCustomerContactRequests,
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
